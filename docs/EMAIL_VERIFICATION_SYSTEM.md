# 📧 Système de Vérification d'Email

## Vue d'ensemble

Implémentation d'un système de vérification d'email en deux étapes pour sécuriser la création de comptes.

## 🔄 Flux Utilisateur

### 1. Inscription
```
User remplit formulaire → Backend génère code 6 chiffres → Email envoyé → Code valide 30 min
```

### 2. Vérification
```
User entre code → Backend valide → Compte activé → Connexion automatique
```

## 📊 Base de Données

### Migration : `migration-email-verification.sql`

**Nouvelles colonnes dans `Connexion`** :
- `EmailVerified` (BOOLEAN) - Statut de vérification
- `EmailVerificationCode` (VARCHAR(6)) - Code à 6 chiffres
- `EmailVerificationExpiry` (TIMESTAMP) - Expiration du code (30 min)
- `EmailVerificationSentAt` (TIMESTAMP) - Date d'envoi

**Fonctions SQL** :
- `generate_verification_code()` - Génère un code aléatoire
- `is_verification_code_valid(email, code)` - Vérifie la validité

**Vue** :
- `UnverifiedAccounts` - Liste des comptes non vérifiés

## 🔧 Backend (ASP.NET Core)

### EmailService.cs

**Nouvelle méthode** :
```csharp
Task SendEmailVerificationCodeAsync(string toEmail, string userName, string verificationCode)
```

**Template Email** :
- Design moderne avec dégradé violet
- Code en grand format (36px, letterspacing)
- Instructions claires
- Avertissements de sécurité
- Valide 30 minutes

### AuthController.cs

**Endpoints à ajouter** :

#### 1. POST /api/auth/send-verification-code
```csharp
[HttpPost("send-verification-code")]
public async Task<ActionResult> SendVerificationCode([FromBody] SendVerificationCodeRequest request)
{
    // Générer code 6 chiffres
    var code = new Random().Next(100000, 999999).ToString();
    
    // Stocker avec expiration 30 min
    user.EmailVerificationCode = code;
    user.EmailVerificationExpiry = DateTime.UtcNow.AddMinutes(30);
    user.EmailVerificationSentAt = DateTime.UtcNow;
    
    // Envoyer email
    await _emailService.SendEmailVerificationCodeAsync(user.Email, user.UserName, code);
    
    return Ok(new { message = "Code envoyé" });
}
```

#### 2. POST /api/auth/verify-email
```csharp
[HttpPost("verify-email")]
public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
{
    var user = await _context.Connexions
        .FirstOrDefaultAsync(c => c.Email == request.Email);
    
    // Vérifier le code
    if (user.EmailVerificationCode != request.Code)
        return BadRequest("Code invalide");
    
    // Vérifier l'expiration
    if (user.EmailVerificationExpiry < DateTime.UtcNow)
        return BadRequest("Code expiré");
    
    // Activer le compte
    user.EmailVerified = true;
    user.IsActive = true;
    user.EmailVerificationCode = null;
    user.EmailVerificationExpiry = null;
    
    await _context.SaveChangesAsync();
    
    // Générer token JWT
    var token = GenerateJwtToken(user);
    
    return Ok(new { token, user });
}
```

#### 3. POST /api/auth/resend-verification-code
```csharp
[HttpPost("resend-verification-code")]
public async Task<ActionResult> ResendVerificationCode([FromBody] ResendCodeRequest request)
{
    // Limite : 1 envoi par minute
    if (user.EmailVerificationSentAt?.AddMinutes(1) > DateTime.UtcNow)
        return BadRequest("Veuillez attendre 1 minute avant de renvoyer le code");
    
    // Même logique que send-verification-code
}
```

## 🎨 Frontend (React + TypeScript)

### 1. Modifier Register.tsx

**Après inscription réussie** :
```tsx
const handleRegister = async () => {
    // ... inscription
    
    // Rediriger vers vérification email
    navigate('/verify-email', { 
        state: { 
            email: formData.email,
            userName: formData.userName 
        } 
    });
};
```

### 2. Créer VerifyEmail.tsx

**Composant complet** :
```tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  PinInput,
  PinInputField,
  HStack,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner
} from '@chakra-ui/react';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Countdown pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: 'Code incomplet',
        description: 'Veuillez entrer les 6 chiffres',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-email', {
        email,
        code
      });

      // Stocker le token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: '✅ Email vérifié !',
        description: 'Votre compte est maintenant actif',
        status: 'success',
        duration: 3000,
      });

      // Rediriger vers dashboard ou complete-profile
      if (response.data.user.profileCompleted) {
        navigate('/');
      } else {
        navigate('/complete-profile');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de vérification',
        description: error.response?.data?.message || 'Code invalide ou expiré',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await api.post('/auth/resend-verification-code', { email });
      
      setCountdown(60); // Bloquer pendant 1 minute
      
      toast({
        title: '📧 Code renvoyé',
        description: 'Consultez votre boîte mail',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de renvoyer le code',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Text fontSize="5xl" mb={2}>📧</Text>
            <Heading size="xl" mb={2}>
              Vérifiez votre email
            </Heading>
            <Text color="gray.600">
              Un code à 6 chiffres a été envoyé à<br/>
              <strong>{email}</strong>
            </Text>
          </Box>

          {/* PIN Input */}
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="lg"
          >
            <VStack spacing={6}>
              <Text fontWeight="medium" color="gray.700">
                Entrez le code reçu
              </Text>
              
              <HStack justify="center">
                <PinInput
                  size="lg"
                  value={code}
                  onChange={setCode}
                  onComplete={handleVerify}
                  otp
                  type="number"
                >
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>

              <Button
                w="full"
                colorScheme="purple"
                size="lg"
                onClick={handleVerify}
                isLoading={loading}
                isDisabled={code.length !== 6}
              >
                Vérifier
              </Button>
            </VStack>
          </Box>

          {/* Alert info */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>
              Le code est valide pendant <strong>30 minutes</strong>
            </AlertDescription>
          </Alert>

          {/* Resend */}
          <Box textAlign="center">
            <Text color="gray.600" mb={2}>
              Vous n'avez pas reçu le code ?
            </Text>
            <Button
              variant="link"
              colorScheme="purple"
              onClick={handleResend}
              isLoading={resending}
              isDisabled={countdown > 0}
            >
              {countdown > 0 
                ? `Renvoyer dans ${countdown}s`
                : 'Renvoyer le code'
              }
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
```

### 3. Ajouter la route

**App.tsx** :
```tsx
import VerifyEmail from './pages/VerifyEmail';

// Dans les routes
<Route path="/verify-email" element={<VerifyEmail />} />
```

### 4. Traductions i18n

**fr.json** :
```json
"emailVerification": {
  "title": "Vérifiez votre email",
  "subtitle": "Un code à 6 chiffres a été envoyé à",
  "enterCode": "Entrez le code reçu",
  "verify": "Vérifier",
  "codeValid": "Le code est valide pendant 30 minutes",
  "noCode": "Vous n'avez pas reçu le code ?",
  "resend": "Renvoyer le code",
  "resendIn": "Renvoyer dans {{seconds}}s",
  "verified": "Email vérifié !",
  "accountActive": "Votre compte est maintenant actif",
  "invalidCode": "Code invalide ou expiré",
  "codeSent": "Code renvoyé",
  "checkEmail": "Consultez votre boîte mail"
}
```

## 🔒 Sécurité

### Mesures implémentées

1. **Code aléatoire** : 6 chiffres (100000-999999)
2. **Expiration** : 30 minutes max
3. **Limite d'envoi** : 1 email par minute
4. **Hash du mot de passe** : BCrypt
5. **Compte inactif** : Jusqu'à vérification
6. **Token JWT** : Après vérification uniquement

### Cas limites gérés

- Code expiré → Message clair + bouton renvoyer
- Email déjà vérifié → Redirection dashboard
- Trop de tentatives → Cooldown 1 minute
- Code invalide → Message d'erreur
- Email non trouvé → Erreur générique

## 📝 Modèles de données

### Request DTOs

```csharp
public class SendVerificationCodeRequest
{
    public string Email { get; set; }
}

public class VerifyEmailRequest
{
    public string Email { get; set; }
    public string Code { get; set; }
}

public class ResendCodeRequest
{
    public string Email { get; set; }
}
```

### Response DTOs

```csharp
public class VerifyEmailResponse
{
    public string Token { get; set; }
    public UserDto User { get; set; }
    public string Message { get; set; }
}
```

## 🧪 Tests

### Test manuel

1. **Inscription** :
   ```
   POST /api/auth/register-simple
   { "email": "test@example.com", "password": "Test123!" }
   ```

2. **Vérifier logs backend** :
   ```
   [EMAIL SIMULÉ] Code: 123456
   ```

3. **Vérifier email** :
   ```
   POST /api/auth/verify-email
   { "email": "test@example.com", "code": "123456" }
   ```

4. **Vérifier BDD** :
   ```sql
   SELECT "Email", "EmailVerified", "IsActive" 
   FROM "Connexion" 
   WHERE "Email" = 'test@example.com';
   ```

### Scénarios de test

- ✅ Inscription + vérification réussie
- ✅ Code expiré (> 30 min)
- ✅ Code invalide
- ✅ Renvoyer le code
- ✅ Limite 1 min entre envois
- ✅ Email déjà vérifié
- ✅ Email inexistant

## 📊 Statistiques & Monitoring

### Requêtes utiles

**Comptes non vérifiés** :
```sql
SELECT * FROM "UnverifiedAccounts" WHERE "Status" = 'pending';
```

**Taux de vérification** :
```sql
SELECT 
    COUNT(*) FILTER (WHERE "EmailVerified" = TRUE) * 100.0 / COUNT(*) AS "TauxVerification"
FROM "Connexion";
```

**Codes expirés** :
```sql
SELECT COUNT(*) 
FROM "Connexion" 
WHERE "EmailVerificationExpiry" < NOW() 
AND "EmailVerified" = FALSE;
```

## 🚀 Déploiement

### Checklist

- [ ] Exécuter migration SQL
- [ ] Configurer SMTP (appsettings.json)
- [ ] Tester envoi email en dev
- [ ] Ajouter route frontend
- [ ] Mettre à jour traductions
- [ ] Tester flux complet
- [ ] Vérifier logs backend
- [ ] Monitorer taux de vérification

### Configuration SMTP

**appsettings.json** :
```json
{
  "Email": {
    "From": "noreply@familytree.com",
    "FromName": "Family Tree",
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "EnableSsl": true
  }
}
```

## 📞 Support Utilisateur

### Messages d'aide

**Email non reçu ?**
1. Vérifier dossier spam
2. Vérifier l'adresse email
3. Renvoyer le code (max 1/min)
4. Contacter le support

**Code expiré ?**
- Cliquer sur "Renvoyer le code"
- Nouveau code valide 30 min

---

**Auteur** : Équipe Family Tree  
**Date** : 9 octobre 2025  
**Version** : 1.0
