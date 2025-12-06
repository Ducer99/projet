# 🔐 Google OAuth Simulation - Smart Redirect Flow

**Date** : 4 décembre 2025  
**Type** : Simulation pour tests (Version simplifiée)  
**Objectif** : Tester le Smart Redirect Flow sans configuration Google OAuth complexe

---

## 🎯 Ce qui a été implémenté

### Version actuelle : **Simulation Google OAuth**

Au lieu d'afficher "Bientôt disponible", les boutons Google créent maintenant automatiquement un compte de test et déclenchent le Smart Redirect Flow.

#### Fonctionnement

```
User clique "Continuer avec Google"
   ↓
Génère email unique : google.user.1733328234567@gmail.com
   ↓
Crée compte via API : POST /auth/register-simple (FamilyID = null)
   ↓
Login automatique avec credentials
   ↓
Reçoit { needsFamilyOnboarding: true }
   ↓
Redirige vers /join-or-create-family ✅
```

---

## 📝 Fichiers modifiés

### 1. Login.tsx (lignes 64-116)

**Avant** :
```tsx
const handleGoogleLogin = () => {
  toast({
    title: 'Bientôt disponible',
    description: "La connexion avec Google sera ajoutée prochainement",
    status: 'info',
    duration: 3000,
  });
};
```

**Après** :
```tsx
const handleGoogleLogin = async () => {
  setIsLoading(true);

  try {
    // Générer email unique
    const timestamp = Date.now();
    const simulatedEmail = `google.user.${timestamp}@gmail.com`;
    const simulatedPassword = `GoogleAuth${timestamp}`;

    // Toast de simulation
    toast({
      title: '🔄 Simulation Google OAuth',
      description: 'Création automatique d\'un compte test...',
      status: 'info',
      duration: 2000,
    });

    // 1. Créer compte sans FamilyID (SDF)
    await api.post('/auth/register-simple', {
      email: simulatedEmail,
      password: simulatedPassword,
      userName: `Google User ${timestamp}`,
    });

    // 2. Login automatique
    const response = await login(simulatedEmail, simulatedPassword);

    toast({
      title: '✅ Connexion Google réussie',
      description: 'Bienvenue ! Configurons votre famille...',
      status: 'success',
      duration: 3000,
    });

    // 3. Smart Redirect
    if (response?.needsFamilyOnboarding === true) {
      navigate('/join-or-create-family'); // ⭐ Test du flux
    } else {
      navigate('/dashboard');
    }
  } catch (error: any) {
    toast({
      title: 'Erreur Google OAuth',
      description: error.message || 'Impossible de se connecter',
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

### 2. Register.tsx (lignes 139-185)

**Même logique** que Login.tsx, mais redirige directement vers `/join-or-create-family` après création du compte.

**Import ajouté** :
```tsx
import api from '../services/api';
```

---

## 🧪 Comment tester

### Test 1 : Login avec Google (utilisateur nouveau)

1. **Ouvrir** : http://localhost:3000/login
2. **Cliquer** : Bouton "Continuer avec Google" (icône Google)
3. **Observer** :
   - ✅ Toast "🔄 Simulation Google OAuth"
   - ✅ Compte créé automatiquement
   - ✅ Login automatique
   - ✅ Toast "✅ Connexion Google réussie"
   - ✅ Redirection vers `/join-or-create-family`
4. **Page de choix** :
   - ✅ 2 cards visibles (Créer / Rejoindre)
5. **Cliquer** : "Créer une nouvelle famille"
6. **Saisir** : "Famille Google Test"
7. **Cliquer** : "Créer ma famille"
8. **Observer** :
   - ✅ Famille créée
   - ✅ Redirection vers `/dashboard`
   - ✅ Dashboard affiche "Famille Google Test"

**Résultat attendu** : Le Smart Redirect Flow fonctionne parfaitement ! 🎉

---

### Test 2 : Register avec Google

1. **Ouvrir** : http://localhost:3000/register
2. **Cliquer** : Bouton Google dans l'Étape 1
3. **Observer** :
   - ✅ Toast "🔄 Simulation Google OAuth"
   - ✅ Compte créé
   - ✅ Toast "✅ Inscription Google réussie"
   - ✅ Redirection directe vers `/join-or-create-family`
4. **Tester** : Rejoindre une famille avec code "FAMILY_10"
5. **Observer** :
   - ✅ Toast "Vous avez rejoint la famille !"
   - ✅ Redirection vers `/dashboard`

---

## 🔍 Vérification en base de données

Après avoir cliqué sur Google, vérifier :

```sql
-- Voir les comptes Google créés
SELECT * FROM "Connexion" 
WHERE "Email" LIKE 'google.user.%@gmail.com' 
ORDER BY "CreatedDate" DESC 
LIMIT 10;

-- Résultat attendu :
-- Email: google.user.1733328234567@gmail.com
-- UserName: Google User 1733328234567
-- FamilyID: NULL (avant de choisir)
-- IsActive: true
-- EmailVerified: true
```

Après avoir créé/rejoint une famille :

```sql
-- Vérifier que FamilyID est maintenant rempli
SELECT "Email", "UserName", "FamilyID", "Role" 
FROM "Connexion" 
WHERE "Email" LIKE 'google.user.%@gmail.com' 
  AND "FamilyID" IS NOT NULL
ORDER BY "CreatedDate" DESC;

-- Résultat attendu :
-- FamilyID: 10 (ou autre)
-- Role: Admin (si créé) ou Member (si rejoint)
```

---

## ⚠️ Limitations de la simulation

Cette version est une **simulation pour tests**. Elle ne remplace pas un vrai Google OAuth.

### Ce qui manque (pour production)

1. **Pas de vraie authentification Google**
   - Pas de validation du token Google
   - Pas de récupération des données Google (nom, email, photo)
   - Pas de gestion des erreurs Google API

2. **Sécurité**
   - Mots de passe générés prévisibles
   - Pas de refresh tokens
   - Pas de révocation possible

3. **UX**
   - Pas de popup Google
   - Pas de sélection de compte Google
   - Email généré au lieu d'utiliser l'email Google réel

4. **Données utilisateur**
   - Pas de photo de profil Google
   - Pas de nom complet Google
   - Pas de langue préférée

---

## 🚀 Migration vers vrai Google OAuth

### Étape 1 : Configuration Google Cloud

1. **Aller sur** : https://console.cloud.google.com
2. **Créer un projet** : "Kinship Haven"
3. **Activer Google+ API**
4. **Créer des credentials OAuth 2.0** :
   - Type : Application Web
   - Origines autorisées : `http://localhost:3000`, `https://votredomaine.com`
   - URIs de redirection : `http://localhost:3000/auth/google/callback`

5. **Récupérer** :
   - Client ID : `123456789-abcdefgh.apps.googleusercontent.com`
   - Client Secret : `GOCSPX-xxxxxxxxxxxxxxxx`

---

### Étape 2 : Installation bibliothèque

```bash
# Frontend
cd frontend
npm install @react-oauth/google

# Backend
cd backend
dotnet add package Google.Apis.Auth
```

---

### Étape 3 : Backend - Endpoint Google Auth

**Fichier** : `/backend/Controllers/AuthController.cs`

Ajouter :

```csharp
using Google.Apis.Auth;

[HttpPost("google")]
public async Task<ActionResult> GoogleAuth([FromBody] GoogleLoginRequest request)
{
    try
    {
        // Valider le token Google
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _configuration["Google:ClientId"] }
        });

        // Vérifier si l'utilisateur existe
        var user = await _context.Connexions
            .FirstOrDefaultAsync(c => c.Email == payload.Email);

        if (user == null)
        {
            // Créer nouveau compte
            user = new Connexion
            {
                Email = payload.Email,
                UserName = payload.Name,
                Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password
                IsActive = true,
                EmailVerified = true,
                FamilyID = null, // SDF !
                Level = 1,
                Role = "Member",
                CreatedDate = DateTime.UtcNow
            };

            _context.Connexions.Add(user);
            await _context.SaveChangesAsync();
        }

        // Générer JWT
        var token = GenerateJwtToken(user);

        // Smart Redirect Flag
        bool needsFamilyOnboarding = user.FamilyID == null || user.FamilyID == 0;

        return Ok(new
        {
            Token = token,
            NeedsFamilyOnboarding = needsFamilyOnboarding,
            User = new
            {
                user.ConnexionID,
                user.UserName,
                user.Email,
                user.FamilyID,
                user.Role,
                GoogleProfile = new
                {
                    Name = payload.Name,
                    Picture = payload.Picture,
                    Email = payload.Email
                }
            }
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = "Token Google invalide", error = ex.Message });
    }
}

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
}
```

---

### Étape 4 : Frontend - Intégration Google

**Fichier** : `/frontend/src/pages/Login.tsx`

**Remplacer** `handleGoogleLogin` par :

```tsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Dans le composant
const handleGoogleSuccess = async (credentialResponse: any) => {
  setIsLoading(true);

  try {
    // Envoyer le token Google au backend
    const response = await api.post('/auth/google', {
      idToken: credentialResponse.credential,
    });

    const { token, needsFamilyOnboarding, user } = response.data;

    // Sauvegarder dans localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    toast({
      title: '✅ Connexion Google réussie',
      description: `Bienvenue ${user.userName} !`,
      status: 'success',
      duration: 3000,
    });

    // Smart Redirect
    if (needsFamilyOnboarding) {
      navigate('/join-or-create-family');
    } else {
      navigate('/dashboard');
    }
  } catch (error: any) {
    toast({
      title: 'Erreur Google OAuth',
      description: error.response?.data?.message || 'Erreur de connexion',
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsLoading(false);
  }
};

const handleGoogleError = () => {
  toast({
    title: 'Erreur Google',
    description: 'Impossible de se connecter avec Google',
    status: 'error',
    duration: 3000,
  });
};

// Dans le JSX, remplacer le bouton Google par :
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  useOneTap
  theme="filled_blue"
  size="large"
  text="continue_with"
/>
```

**Wrapper dans App.tsx** :

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="VOTRE_CLIENT_ID.apps.googleusercontent.com">
      <Router>
        <AuthProvider>
          {/* ... reste du code */}
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
```

---

### Étape 5 : Variables d'environnement

**Backend** : `appsettings.json`
```json
{
  "Google": {
    "ClientId": "123456789-abcdefgh.apps.googleusercontent.com",
    "ClientSecret": "GOCSPX-xxxxxxxxxxxxxxxx"
  }
}
```

**Frontend** : `.env.local`
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
```

Puis dans le code :
```tsx
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
```

---

## 📊 Comparaison : Simulation vs Production

| Fonctionnalité | Simulation (Actuelle) | Production (À venir) |
|----------------|----------------------|---------------------|
| **Création compte** | ✅ Email généré | ✅ Email Google réel |
| **Authentification** | ✅ Password auto | ✅ Token Google validé |
| **Smart Redirect** | ✅ Fonctionne | ✅ Fonctionne |
| **Données utilisateur** | ⚠️ Minimales | ✅ Nom, photo, email |
| **Sécurité** | ⚠️ Tests uniquement | ✅ OAuth 2.0 complet |
| **UX** | ⚠️ Pas de popup | ✅ Popup Google native |
| **Photo profil** | ❌ Non | ✅ Oui (Google Picture) |
| **One-Tap** | ❌ Non | ✅ Oui |
| **Multi-comptes** | ❌ Non | ✅ Sélection compte |

---

## 🎯 Checklist de migration

Quand vous êtes prêt à passer en production :

### Backend
- [ ] Installer `Google.Apis.Auth` package
- [ ] Créer endpoint `POST /auth/google`
- [ ] Valider token avec `GoogleJsonWebSignature.ValidateAsync()`
- [ ] Gérer création/login utilisateur
- [ ] Retourner `needsFamilyOnboarding` flag
- [ ] Ajouter Client ID/Secret dans `appsettings.json`
- [ ] Tester avec Postman

### Frontend
- [ ] Installer `@react-oauth/google`
- [ ] Wrapper App avec `GoogleOAuthProvider`
- [ ] Remplacer simulation par `<GoogleLogin />`
- [ ] Gérer `onSuccess` avec appel API backend
- [ ] Tester Smart Redirect Flow
- [ ] Ajouter Client ID dans `.env.local`

### Google Cloud
- [ ] Créer projet Google Cloud
- [ ] Activer Google+ API
- [ ] Créer credentials OAuth 2.0
- [ ] Configurer origines autorisées
- [ ] Configurer URIs de redirection
- [ ] Récupérer Client ID/Secret

### Tests
- [ ] Test 1 : Nouveau compte Google → /join-or-create-family
- [ ] Test 2 : Compte existant avec famille → /dashboard
- [ ] Test 3 : Popup Google s'ouvre correctement
- [ ] Test 4 : One-Tap fonctionne
- [ ] Test 5 : Multi-comptes Google
- [ ] Test 6 : Révocation token Google
- [ ] Test 7 : Gestion erreurs (refus, timeout)

---

## 📝 Notes importantes

### Pourquoi cette simulation ?

1. **Tests immédiats** : Pas besoin de configurer Google Cloud maintenant
2. **Validation du flux** : On peut tester le Smart Redirect Flow sans dépendance externe
3. **Développement rapide** : Focus sur la logique métier, pas l'intégration OAuth
4. **Documentation claire** : Sait exactement ce qui se passe en coulisses

### Quand migrer vers vrai OAuth ?

- **Maintenant** : Si vous déployez en production
- **Plus tard** : Si vous êtes encore en développement local

### Différence visible pour l'utilisateur

**Simulation** :
```
Clic → Toast "Simulation" → Compte créé → /join-or-create-family
```

**Production** :
```
Clic → Popup Google → Sélection compte → Backend validation → /join-or-create-family
```

Le Smart Redirect Flow reste **identique** dans les deux cas ! 🎉

---

## 🎉 Status actuel

✅ **Simulation fonctionnelle** : Bouton Google crée un compte SDF et déclenche le Smart Redirect Flow

✅ **Smart Redirect testé** : Le flux `/join-or-create-family` fonctionne avec Google

✅ **Documentation complète** : Guide de migration vers vrai OAuth disponible

✅ **Prêt pour tests** : Cliquez sur "Continuer avec Google" et testez !

---

**Date de création** : 4 décembre 2025  
**Type** : Simulation pour développement  
**Migration vers OAuth réel** : Quand prêt pour production  
**Status** : ✅ **FONCTIONNEL ET TESTABLE**
