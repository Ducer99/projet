using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace FamilyTreeAPI.Services
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string toEmail, string userName, string familyName);
        Task SendPasswordResetCodeAsync(string toEmail, string verificationCode);
        Task SendEmailVerificationCodeAsync(string toEmail, string userName, string verificationCode);
        Task SendBirthdayNotificationAsync(string toEmail, string recipientName, string birthdayPersonName, int age);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName, string familyName)
        {
            var subject = "Bienvenue dans votre Arbre Généalogique Familial !";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #3182CE; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f7f7f7; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ background-color: #3182CE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🌳 Arbre Généalogique Familial</h1>
        </div>
        <div class='content'>
            <h2>Bienvenue {userName} !</h2>
            <p>Votre compte a été créé avec succès dans la famille <strong>{familyName}</strong>.</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
                <li>📊 Consulter votre arbre généalogique complet</li>
                <li>👥 Ajouter et modifier des membres de la famille</li>
                <li>💑 Gérer les mariages et relations familiales</li>
                <li>📝 Ajouter des notes et photos de famille</li>
            </ul>
            <p style='text-align: center;'>
                <a href='http://localhost:3000/login' class='button'>Se connecter maintenant</a>
            </p>
            <p>Votre email de connexion : <strong>{toEmail}</strong></p>
            <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
        </div>
        <div class='footer'>
            <p>© 2025 Arbre Généalogique Familial - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetCodeAsync(string toEmail, string verificationCode)
        {
            var subject = "Code de réinitialisation de mot de passe";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #E53E3E; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f7f7f7; padding: 30px; border-radius: 0 0 5px 5px; }}
        .code {{ background-color: white; border: 2px dashed #E53E3E; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 5px; }}
        .warning {{ background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Réinitialisation de mot de passe</h1>
        </div>
        <div class='content'>
            <h2>Code de vérification</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Voici votre code de vérification :</p>
            <div class='code'>{verificationCode}</div>
            <div class='warning'>
                <strong>⏱️ Attention :</strong> Ce code expire dans 5 minutes.
            </div>
            <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>
        </div>
        <div class='footer'>
            <p>© 2025 Arbre Généalogique Familial - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["Email:FromName"] ?? "Arbre Généalogique",
                    _configuration["Email:FromAddress"] ?? "noreply@familytree.com"
                ));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                // Pour le développement local, on simule l'envoi
                var smtpEnabled = _configuration.GetValue<bool>("Email:Enabled");
                
                if (smtpEnabled)
                {
                    var host = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
                    var port = _configuration.GetValue<int>("Email:SmtpPort", 587);
                    var username = _configuration["Email:Username"];
                    var password = _configuration["Email:Password"];

                    await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                    
                    if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                    {
                        await client.AuthenticateAsync(username, password);
                    }
                    
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                    
                    _logger.LogInformation($"Email envoyé à {toEmail}: {subject}");
                }
                else
                {
                    // Mode développement : on log juste l'email au lieu de l'envoyer
                    _logger.LogInformation($"[EMAIL SIMULÉ] À: {toEmail}");
                    _logger.LogInformation($"[EMAIL SIMULÉ] Sujet: {subject}");
                    _logger.LogInformation($"[EMAIL SIMULÉ] Corps:\n{htmlBody}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'envoi de l'email à {toEmail}");
                // On ne lance pas d'exception pour ne pas bloquer la création de compte
            }
        }

        public async Task SendBirthdayNotificationAsync(string toEmail, string recipientName, string birthdayPersonName, int age)
        {
            var subject = $"🎂 Aujourd'hui c'est l'anniversaire de {birthdayPersonName} !";
            var ageText = age > 0 ? $"fête ses <strong>{age} ans</strong>" : "fête son anniversaire";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background-color: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; }}
        .cake {{ font-size: 80px; text-align: center; margin: 20px 0; }}
        .name {{ font-size: 28px; font-weight: bold; color: #f5576c; text-align: center; margin: 10px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin: 0; font-size: 28px;'>🌳 Family Tree</h1>
            <p style='margin: 10px 0 0 0; opacity: 0.9;'>Rappel d'anniversaire</p>
        </div>
        <div class='content'>
            <p style='font-size: 16px;'>Bonjour <strong>{recipientName}</strong>,</p>
            <div class='cake'>🎂</div>
            <div class='name'>{birthdayPersonName}</div>
            <p style='text-align: center; font-size: 18px; color: #4a5568;'>{ageText} aujourd'hui !</p>
            <p style='text-align: center; font-size: 16px; color: #718096;'>
                N'oubliez pas de lui souhaiter un joyeux anniversaire 🎉
            </p>
        </div>
        <div class='footer'>
            <p>© 2025 Family Tree - Votre arbre généalogique en ligne</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendEmailVerificationCodeAsync(string toEmail, string userName, string verificationCode)
        {
            var subject = "🔐 Vérifiez votre adresse email - Family Tree";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background-color: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; }}
        .code-box {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        .code {{ font-size: 36px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace; }}
        .info-box {{ background-color: #f7fafc; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }}
        .warning-box {{ background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0; border-radius: 4px; color: #c53030; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }}
        .security-note {{ background-color: #ebf8ff; padding: 15px; border-radius: 8px; margin-top: 20px; }}
        ul {{ padding-left: 20px; }}
        li {{ margin: 10px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin: 0; font-size: 28px;'>🌳 Family Tree</h1>
            <p style='margin: 10px 0 0 0; opacity: 0.9;'>Vérification d'adresse email</p>
        </div>
        <div class='content'>
            <h2 style='color: #2d3748; margin-top: 0;'>Bonjour {userName} ! 👋</h2>
            
            <p style='font-size: 16px; color: #4a5568;'>
                Merci de vous être inscrit sur <strong>Family Tree</strong>. Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email.
            </p>

            <div class='code-box'>
                <p style='margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;'>Votre code de vérification</p>
                <div class='code'>{verificationCode}</div>
                <p style='margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;'>Code valide pendant 30 minutes</p>
            </div>

            <div class='info-box'>
                <strong>📋 Comment procéder :</strong>
                <ol style='margin: 10px 0 0 0;'>
                    <li>Copiez le code ci-dessus</li>
                    <li>Retournez sur la page de vérification</li>
                    <li>Collez le code dans le champ prévu</li>
                    <li>Cliquez sur Vérifier</li>
                </ol>
            </div>

            <div class='security-note'>
                <p style='margin: 0; font-size: 14px;'>
                    <strong>🔒 Sécurité :</strong><br>
                    Ce code est strictement personnel et confidentiel. Ne le partagez avec personne. L'équipe Family Tree ne vous demandera jamais ce code.
                </p>
            </div>

            <div class='warning-box'>
                <strong>⚠️ Vous n'avez pas demandé ce code ?</strong><br>
                Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email. Votre compte ne sera pas créé sans la vérification du code.
            </div>

            <p style='margin-top: 30px; color: #4a5568;'>
                À très bientôt sur Family Tree ! 🌳<br>
                <em>L'équipe Family Tree</em>
            </p>
        </div>
        <div class='footer'>
            <p style='margin: 5px 0;'>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p style='margin: 5px 0;'>© 2025 Family Tree - Votre arbre généalogique en ligne</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}
