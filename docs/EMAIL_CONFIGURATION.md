# Configuration Email - Instructions

## 📧 Configuration SMTP pour l'envoi d'emails

### Option 1 : Gmail (Recommandé pour le développement)

1. **Créez un mot de passe d'application Gmail** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Activez la validation en 2 étapes si nécessaire
   - Créez un nouveau mot de passe d'application
   - Nommez-le "Family Tree App"
   - Copiez le mot de passe généré (16 caractères)

2. **Configurez le fichier `backend/appsettings.Development.json`** :
   ```json
   {
     "Email": {
       "Enabled": true,
       "FromName": "Family Tree",
       "FromAddress": "votre-email@gmail.com",
       "SmtpHost": "smtp.gmail.com",
       "SmtpPort": 587,
       "Username": "votre-email@gmail.com",
       "Password": "votre-mot-de-passe-application-ici"
     }
   }
   ```

3. **Redémarrez le backend** :
   ```bash
   cd backend
   dotnet run
   ```

### Option 2 : Autre fournisseur SMTP

Modifiez les paramètres selon votre fournisseur :

**Outlook/Hotmail** :
- SmtpHost: "smtp-mail.outlook.com"
- SmtpPort: 587

**Yahoo** :
- SmtpHost: "smtp.mail.yahoo.com"
- SmtpPort: 587

**SendGrid** :
- SmtpHost: "smtp.sendgrid.net"
- SmtpPort: 587

### Mode Développement (Sans SMTP)

Si vous ne configurez pas SMTP :
- `"Enabled": false` dans appsettings.json
- Les emails sont simulés et affichés dans les logs du backend
- Cherchez `[EMAIL SIMULÉ]` dans les logs pour voir le code de vérification

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- Le fichier `appsettings.Development.json` est dans `.gitignore`
- Ne commitez JAMAIS vos mots de passe
- Utilisez des variables d'environnement en production
- Changez régulièrement vos mots de passe d'application

## 🧪 Test

Pour tester l'envoi d'email :
1. Créez un nouveau compte sur http://localhost:3001/register-simple
2. Vérifiez votre boîte mail
3. Entrez le code reçu sur la page de vérification

## 📝 Variables d'environnement (Production)

Pour la production, utilisez plutôt :

```bash
export EMAIL_ENABLED=true
export EMAIL_FROM_NAME="Family Tree"
export EMAIL_FROM_ADDRESS="noreply@familytree.com"
export EMAIL_SMTP_HOST="smtp.gmail.com"
export EMAIL_SMTP_PORT=587
export EMAIL_USERNAME="votre-email@gmail.com"
export EMAIL_PASSWORD="votre-mot-de-passe"
```

Puis modifiez `Program.cs` pour lire ces variables.
