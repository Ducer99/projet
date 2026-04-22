using Microsoft.EntityFrameworkCore;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;

namespace FamilyTreeAPI.Services
{
    public class BirthdayNotificationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BirthdayNotificationService> _logger;

        public BirthdayNotificationService(
            IServiceScopeFactory scopeFactory,
            ILogger<BirthdayNotificationService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("BirthdayNotificationService démarré.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = TimeUntilNextRun(8, 0); // 8h00 UTC chaque jour
                _logger.LogInformation("Prochain rappel anniversaire dans {delay}", delay);

                await Task.Delay(delay, stoppingToken);

                if (!stoppingToken.IsCancellationRequested)
                {
                    await SendTodaysBirthdayNotificationsAsync();
                }
            }
        }

        private static TimeSpan TimeUntilNextRun(int hour, int minute)
        {
            var now = DateTime.UtcNow;
            var nextRun = new DateTime(now.Year, now.Month, now.Day, hour, minute, 0, DateTimeKind.Utc);
            if (nextRun <= now)
                nextRun = nextRun.AddDays(1);
            return nextRun - now;
        }

        private async Task SendTodaysBirthdayNotificationsAsync()
        {
            _logger.LogInformation("Vérification des anniversaires du jour...");

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<FamilyTreeContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                var today = DateTime.UtcNow;
                var currentYear = today.Year;

                var birthdayPersons = await db.Persons
                    .Where(p =>
                        p.Alive &&
                        p.Birthday.HasValue &&
                        p.Birthday.Value.Month == today.Month &&
                        p.Birthday.Value.Day == today.Day)
                    .ToListAsync();

                _logger.LogInformation("{count} anniversaire(s) trouvé(s) aujourd'hui.", birthdayPersons.Count);

                foreach (var person in birthdayPersons)
                {
                    var alreadySent = await db.BirthdayNotificationLogs
                        .AnyAsync(l =>
                            l.FamilyId == person.FamilyID &&
                            l.PersonId == person.PersonID &&
                            l.Year == currentYear);

                    if (alreadySent)
                    {
                        _logger.LogInformation(
                            "Notification déjà envoyée pour {name} (FamilyId={fid}, Year={year}). Ignoré.",
                            $"{person.FirstName} {person.LastName}", person.FamilyID, currentYear);
                        continue;
                    }

                    // SentAt = null : log inséré mais emails pas encore envoyés
                    // Diagnostic : SELECT * FROM "BirthdayNotificationLog" WHERE "SentAt" IS NULL
                    // Correction : DELETE ... WHERE "SentAt" IS NULL AND "Year" = EXTRACT(YEAR FROM NOW())
                    var log = new BirthdayNotificationLog
                    {
                        FamilyId = (int)person.FamilyID,
                        PersonId = person.PersonID,
                        Year = currentYear,
                        SentAt = null
                    };

                    try
                    {
                        db.BirthdayNotificationLogs.Add(log);
                        await db.SaveChangesAsync();
                    }
                    catch (DbUpdateException)
                    {
                        _logger.LogWarning(
                            "Race condition détectée pour {name} — notification déjà verrouillée par une autre instance.",
                            $"{person.FirstName} {person.LastName}");
                        db.Entry(log).State = EntityState.Detached;
                        continue;
                    }

                    int age = currentYear - person.Birthday!.Value.Year;

                    var recipients = await db.Connexions
                        .Where(c =>
                            c.FamilyID == person.FamilyID &&
                            c.IsActive &&
                            c.EmailVerified &&
                            !string.IsNullOrEmpty(c.Email))
                        .ToListAsync();

                    var birthdayPersonName = $"{person.FirstName} {person.LastName}";
                    _logger.LogInformation(
                        "Envoi des notifications pour {name} ({count} destinataires)",
                        birthdayPersonName, recipients.Count);

                    foreach (var recipient in recipients)
                    {
                        try
                        {
                            var recipientName = recipient.UserName;

                            if (recipient.IDPerson.HasValue)
                            {
                                var recipientPerson = await db.Persons.FindAsync(recipient.IDPerson.Value);
                                if (recipientPerson != null)
                                    recipientName = recipientPerson.FirstName;
                            }

                            await emailService.SendBirthdayNotificationAsync(
                                recipient.Email,
                                recipientName,
                                birthdayPersonName,
                                age
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Erreur envoi notification anniversaire à {email}", recipient.Email);
                        }
                    }

                    // SentAt = valeur → tous les emails traités avec succès
                    log.SentAt = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification des anniversaires");
            }
        }
    }
}
