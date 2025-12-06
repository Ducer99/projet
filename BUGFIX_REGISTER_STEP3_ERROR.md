# 🐛 BUGFIX - Erreur Registration Step 3

## 🔴 Problème Identifié

**Symptôme** : Erreur "Registration error - An error occurred" lors du clic sur "Créer la famille" ou "Rejoindre la famille" (Step 3)

## 🔍 Diagnostic

### Cause Racine

L'endpoint `/auth/register` actuel nécessite un `IDPerson` existant, ce qui ne correspond PAS au flux d'inscription complet avec Step 3.

```typescript
// ❌ PROBLÈME dans handleSubmit()
const registerResponse = await api.post('/auth/register', {
  email,
  password,
  firstName,  // ❌ Non supporté par /auth/register
  lastName,   // ❌ Non supporté par /auth/register
  sex,        // ❌ Non supporté par /auth/register
});
```

### Flux Actuel (Incorrect)

1. User remplit Steps 1-2-3
2. Frontend appelle `/auth/register` avec firstName, lastName, sex
3. **❌ Backend rejette** : endpoint attend seulement email + password + IDPerson

## ✅ Solution

### Option 1: Utiliser `/auth/register-simple` (RECOMMANDÉ)

Endpoint existant qui crée un compte temporaire sans Person ni Family.

```typescript
// ✅ SOLUTION
// Étape 1: Créer compte temporaire
const registerResponse = await api.post('/auth/register-simple', {
  email,
  password,
  userName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
});

// Stocker le token
localStorage.setItem('token', registerResponse.data.token);

// Étape 2: Compléter le profil (créer Person)
await api.post('/auth/complete-profile', {
  firstName,
  lastName,
  sex,
  dateOfBirth: null // Optionnel
});

// Étape 3: Créer ou rejoindre famille
if (actionChoice === 'create') {
  await api.post('/families/create', { familyName });
} else {
  await api.post('/families/join', { inviteCode });
}
```

### Option 2: Créer nouvel endpoint `/auth/register-complete`

Créer un endpoint backend qui gère tout en une seule requête.

```csharp
[HttpPost("register-complete")]
public async Task<ActionResult> RegisterComplete([FromBody] CompleteRegisterRequest request)
{
    // 1. Créer Connexion
    // 2. Créer Person
    // 3. Créer ou rejoindre Family
    // 4. Lier tout ensemble
    // 5. Retourner token
}
```

## 🛠️ Implémentation Option 1 (Quick Fix)

### Frontend: Register.tsx

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  if (actionChoice === 'create' && !familyName) {
    toast({
      title: t('common.error'),
      description: 'Veuillez entrer le nom de la famille',
      status: 'error',
      duration: 3000,
    });
    return;
  }

  if (actionChoice === 'join' && !inviteCode) {
    toast({
      title: t('common.error'),
      description: 'Veuillez entrer le code d\'invitation',
      status: 'error',
      duration: 3000,
    });
    return;
  }

  setIsLoading(true);

  try {
    // ✅ Étape 1: Créer compte temporaire
    const registerResponse = await api.post('/auth/register-simple', {
      email,
      password,
      userName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
    });

    if (registerResponse.data.token) {
      localStorage.setItem('token', registerResponse.data.token);
    }

    // ✅ Étape 2: Compléter le profil (créer Person)
    await api.post('/auth/complete-profile', {
      firstName,
      lastName,
      sex,
      dateOfBirth: null
    });

    // ✅ Étape 3: Créer ou rejoindre famille
    if (actionChoice === 'create') {
      await api.post('/families/create', { familyName });
      toast({
        title: '✅ Compte créé !',
        description: `Bienvenue dans la famille ${familyName}`,
        status: 'success',
        duration: 3000,
      });
    } else {
      await api.post('/families/join', { inviteCode: inviteCode.toUpperCase() });
      toast({
        title: '✅ Compte créé !',
        description: 'Vous avez rejoint la famille avec succès',
        status: 'success',
        duration: 3000,
      });
    }

    // ✅ Rediriger vers dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Message d'erreur détaillé
    const errorMessage = error.response?.data?.message 
      || error.response?.data 
      || error.message 
      || t('auth.errorOccurred');
    
    toast({
      title: t('auth.registerError'),
      description: errorMessage,
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Backend: Vérifier `/auth/complete-profile`

```bash
# Chercher l'endpoint
grep -n "complete-profile" backend/Controllers/AuthController.cs
```

Si l'endpoint n'existe pas, il faut le créer :

```csharp
[HttpPost("complete-profile")]
[Authorize]
public async Task<ActionResult> CompleteProfile([FromBody] CompleteProfileRequest request)
{
    // Récupérer l'utilisateur
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!int.TryParse(userIdClaim, out int userId))
    {
        return Unauthorized(new { message = "Utilisateur non authentifié" });
    }

    var connexion = await _context.Connexions.FindAsync(userId);
    if (connexion == null)
    {
        return NotFound(new { message = "Connexion introuvable" });
    }

    // Créer la Person
    var person = new Person
    {
        FirstName = request.FirstName,
        LastName = request.LastName,
        Sex = request.Sex,
        DateOfBirth = request.DateOfBirth,
        FamilyID = connexion.FamilyID, // Peut être null pour l'instant
        CreatedDate = DateTime.UtcNow
    };

    _context.Persons.Add(person);
    await _context.SaveChangesAsync();

    // Lier Person à Connexion
    connexion.IDPerson = person.PersonID;
    connexion.ProfileCompleted = true;
    await _context.SaveChangesAsync();

    return Ok(new
    {
        PersonID = person.PersonID,
        Message = "Profil complété avec succès"
    });
}
```

## 🧪 Test

1. Ouvrir http://localhost:3000/register
2. Remplir Step 1 (email, password)
3. Remplir Step 2 (firstName, lastName, sex)
4. Remplir Step 3 (create → familyName OU join → inviteCode)
5. Cliquer bouton dynamique
6. ✅ Vérifier: Compte créé + Family créée/jointe + Redirect dashboard

## 📊 Logs Backend à Surveiller

```bash
# Terminal backend
POST /api/auth/register-simple → 200 OK
POST /api/auth/complete-profile → 200 OK
POST /api/families/create → 200 OK (ou /families/join)
```

## 🔧 Debug Console Frontend

```javascript
// Dans handleSubmit, ajouter:
console.log('Step 1: register-simple...');
console.log('Step 2: complete-profile...');
console.log('Step 3: families/' + actionChoice + '...');
```

---

**Date**: 6 décembre 2025  
**Status**: 🔧 Solution proposée - Implémentation requise  
**Impact**: Bloque l'inscription complète Step 3
