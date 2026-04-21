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

                // Trouver toutes les personnes vivantes dont c'est l'anniversaire aujourd'hui
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
                    // ✅ Vérifier si la notification a déjà été envoyée cette année
                    // (contrainte unique sur FamilyId + PersonId + Year en DB)
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

                    // Enregistrer le log AVANT d'envoyer pour verrouiller contre les doublons
                    // En cas de crash après l'insert mais avant l'envoi, on préfère rater un envoi
                    // plutôt que d'envoyer en double.
                    var log = new BirthdayNotificationLog
                    {
                        FamilyId = (int)person.FamilyID,
                        PersonId = person.PersonID,
                        Year = currentYear,
                        SentAt = DateTime.UtcNow
                    };

                    try
                    {
                        db.BirthdayNotificationLogs.Add(log);
                        await db.SaveChangesAsync();
                    }
                    catch (DbUpdateException)
                    {
                        // Une autre instance a déjà inséré ce log (race condition) — on skip
                        _logger.LogWarning(
                            "Race condition détectée pour {name} — notification déjà verrouillée par une autre instance.",
                            $"{person.FirstName} {person.LastName}");
                        db.Entry(log).State = EntityState.Detached;
                        continue;
                    }

                    // Calculer l'âge
                    int age = currentYear - person.Birthday!.Value.Year;

                    // Trouver tous les comptes actifs de la même famille avec email vérifié
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
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification des anniversaires");
            }
        }
    }
}
