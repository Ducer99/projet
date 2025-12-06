# 🔍 LOGS DE DEBUGGING AJOUTÉS - Register Complete Profile

## 📋 Context

L'utilisateur rencontre toujours l'erreur **"Registration error - Request failed with status code 500"** lors de l'inscription Step 3.

Les corrections précédentes ont été appliquées :
- ✅ Flux 3 étapes (register-simple → complete-profile → families/create|join)
- ✅ Champ `Gender` renommé en `Sex` dans `CompleteProfileRequest`

**Mais l'erreur 500 persiste.**

## 🛠️ Logs Ajoutés

### Frontend - Register.tsx (ligne ~150)

```typescript
console.log('🔵 Step 2: Completing profile...');
console.log('📤 Sending profile data:', {
  firstName,
  lastName,
  sex,
  sexType: typeof sex,
  sexLength: sex.length,
  dateOfBirth: null,
  birthCity: '',
  birthCountry: '',
  activity: '',
});

const profileResponse = await api.post('/auth/complete-profile', {
  firstName,
  lastName,
  sex,
  dateOfBirth: null,
  birthCity: '',
  birthCountry: '',
  activity: '',
});

console.log('✅ Profile completed');
console.log('📥 Profile response:', profileResponse.data);
```

**Informations loggées** :
- ✅ Valeur de `sex`
- ✅ Type de `sex` (string, object, etc.)
- ✅ Longueur de `sex`
- ✅ Toutes les données envoyées
- ✅ Réponse du serveur (si succès)

### Backend - AuthController.cs (ligne ~385+)

#### Début de la fonction `CompleteProfile`

```csharp
Console.WriteLine("========== 🔵 COMPLETE-PROFILE DEBUG START ==========");
Console.WriteLine($"📥 Request received:");
Console.WriteLine($"   FirstName: '{request.FirstName}' (length: {request.FirstName?.Length ?? 0})");
Console.WriteLine($"   LastName: '{request.LastName}' (length: {request.LastName?.Length ?? 0})");
Console.WriteLine($"   Sex: '{request.Sex}' (length: {request.Sex?.Length ?? 0})");
Console.WriteLine($"   BirthDate: {request.BirthDate}");
Console.WriteLine($"   BirthCity: '{request.BirthCity}' (length: {request.BirthCity?.Length ?? 0})");
Console.WriteLine($"   BirthCountry: '{request.BirthCountry}' (length: {request.BirthCountry?.Length ?? 0})");
Console.WriteLine($"   Activity: '{request.Activity}' (length: {request.Activity?.Length ?? 0})");

var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
Console.WriteLine($"👤 User ID from token: {userId}");

var connexion = await _context.Connexions.FindAsync(userId);

if (connexion == null)
{
    Console.WriteLine("❌ ERROR: Connexion not found for userId: " + userId);
    return NotFound("Utilisateur non trouvé");
}

Console.WriteLine($"✅ Connexion found: ID={connexion.ConnexionID}, Email={connexion.Email}");
```

**Informations loggées** :
- ✅ Toutes les données reçues du frontend
- ✅ Longueur de chaque champ (pour détecter valeurs nulles/vides)
- ✅ User ID extrait du JWT token
- ✅ Connexion trouvée ou non

#### Avant la création de Person

```csharp
Console.WriteLine("📝 Creating Person object...");

Console.WriteLine($"🔍 Sex value before Person creation: '{request.Sex}'");
Console.WriteLine($"   Is null or empty? {string.IsNullOrEmpty(request.Sex)}");
Console.WriteLine($"   Is 'M'? {request.Sex == "M"}");
Console.WriteLine($"   Is 'F'? {request.Sex == "F"}");

var person = new Person
{
    FirstName = request.FirstName,
    LastName = request.LastName,
    Sex = request.Sex,  // ✅ Changé de request.Gender à request.Sex
    // ...
};
```

**Informations loggées** :
- ✅ Valeur exacte de `Sex` avant création Person
- ✅ Test si null/empty
- ✅ Test si égal à "M"
- ✅ Test si égal à "F"

#### Sauvegarde dans la base de données

```csharp
try 
{
    Console.WriteLine("💾 Attempting to save Person to database...");
    await _context.SaveChangesAsync();
    Console.WriteLine("✅ Person saved successfully! PersonID: " + person.PersonID);
}
catch (Exception ex)
{
    Console.WriteLine("❌ ERROR saving Person to database:");
    Console.WriteLine($"   Exception Type: {ex.GetType().Name}");
    Console.WriteLine($"   Message: {ex.Message}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
    }
    Console.WriteLine($"   Stack Trace: {ex.StackTrace}");
    Console.WriteLine("========== 🔴 COMPLETE-PROFILE DEBUG END (ERROR) ==========");
    throw;
}
```

**Informations loggées** :
- ✅ Tentative de sauvegarde
- ✅ Succès avec PersonID
- ✅ **OU** Erreur détaillée :
  - Type d'exception
  - Message d'erreur
  - Inner exception (détails PostgreSQL)
  - Stack trace complet

#### Fin de la fonction (succès)

```csharp
Console.WriteLine("💾 Saving Connexion updates...");
await _context.SaveChangesAsync();
Console.WriteLine("✅ Connexion updated successfully!");

Console.WriteLine("🔑 Generating new JWT token...");
var token = GenerateJwtToken(connexion);
Console.WriteLine("✅ Token generated!");

Console.WriteLine("========== ✅ COMPLETE-PROFILE DEBUG END (SUCCESS) ==========");
```

**Informations loggées** :
- ✅ Mise à jour Connexion
- ✅ Génération du token
- ✅ Marqueur de fin avec succès

## 📊 Comment Utiliser les Logs

### 1. Ouvrir Console Chrome (Frontend)

1. Ouvrir http://localhost:3000/register
2. Appuyer sur **F12** (DevTools)
3. Onglet **Console**
4. Remplir le formulaire d'inscription
5. Cliquer sur "Créer la famille" ou "Rejoindre la famille"

**Logs attendus** :
```
🔵 Step 1: Creating temporary account...
✅ Token saved, user authenticated
🔵 Step 2: Completing profile...
📤 Sending profile data: {firstName: "Jean", lastName: "Martin", sex: "M", ...}
```

**Si erreur** :
```
❌ Registration error: Error: Request failed with status code 500
Error details: {message: "...", response: {...}, status: 500}
```

### 2. Ouvrir Terminal Backend

Dans le terminal où `dotnet run` s'exécute :

**Logs attendus (succès)** :
```
========== 🔵 COMPLETE-PROFILE DEBUG START ==========
📥 Request received:
   FirstName: 'Jean' (length: 4)
   LastName: 'Martin' (length: 6)
   Sex: 'M' (length: 1)
   BirthDate: 
   BirthCity: '' (length: 0)
   BirthCountry: '' (length: 0)
   Activity: '' (length: 0)
👤 User ID from token: 123
✅ Connexion found: ID=123, Email=jean@example.com
📝 Creating Person object...
🔍 Sex value before Person creation: 'M'
   Is null or empty? False
   Is 'M'? True
   Is 'F'? False
========== DEBUG: CompleteProfile Person Object ==========
FirstName length: 4
LastName length: 6
Email length: 17
Activity length: 0
...
💾 Attempting to save Person to database...
✅ Person saved successfully! PersonID: 456
💾 Saving Connexion updates...
✅ Connexion updated successfully!
🔑 Generating new JWT token...
✅ Token generated!
========== ✅ COMPLETE-PROFILE DEBUG END (SUCCESS) ==========
```

**Logs attendus (erreur)** :
```
========== 🔵 COMPLETE-PROFILE DEBUG START ==========
📥 Request received:
   FirstName: 'Jean' (length: 4)
   LastName: 'Martin' (length: 6)
   Sex: '' (length: 0)  ← ❌ PROBLÈME ICI !
   ...
🔍 Sex value before Person creation: ''
   Is null or empty? True  ← ❌ C'est vide !
   Is 'M'? False
   Is 'F'? False
💾 Attempting to save Person to database...
❌ ERROR saving Person to database:
   Exception Type: DbUpdateException
   Message: An error occurred while saving the entity changes
   Inner Exception: new row for relation "Person" violates check constraint "Person_Sex_check"
   Stack Trace: ...
========== 🔴 COMPLETE-PROFILE DEBUG END (ERROR) ==========
```

## 🎯 Scénarios de Diagnostic

### Scénario 1: Sex est vide côté frontend

**Console Chrome** :
```
📤 Sending profile data: {sex: "", sexType: "string", sexLength: 0, ...}
```

**Solution** : Bug dans le state React (sex n'est pas mis à jour)

### Scénario 2: Sex est correct frontend mais vide backend

**Console Chrome** :
```
📤 Sending profile data: {sex: "M", sexType: "string", sexLength: 1, ...}
```

**Terminal Backend** :
```
📥 Request received:
   Sex: '' (length: 0)  ← Perdu en route !
```

**Solution** : Problème de sérialisation JSON (casse, nom de champ)

### Scénario 3: Sex correct partout mais erreur PostgreSQL

**Terminal Backend** :
```
🔍 Sex value before Person creation: 'M'
   Is null or empty? False
   Is 'M'? True
❌ ERROR saving Person to database:
   Inner Exception: check constraint "Person_Sex_check"
```

**Solution** : Autre champ obligatoire manquant OU contrainte différente

### Scénario 4: Tout fonctionne !

**Console Chrome + Terminal Backend** : Tous les ✅ verts

**Solution** : Problème résolu ! 🎉

## 📝 Actions de Débogage

1. **Lancer l'inscription** sur http://localhost:3000/register
2. **Copier les logs Console Chrome** et me les envoyer
3. **Copier les logs Terminal Backend** et me les envoyer
4. Ensemble, on identifie exactement où ça casse

## 📅 Métadonnées

- **Date** : 6 décembre 2025, 16:50
- **Objectif** : Identifier la cause exacte de l'erreur 500
- **Logs ajoutés** : Frontend (Register.tsx) + Backend (AuthController.cs)
- **Backend recompilé** : ✅ Oui
- **Backend relancé** : ✅ Oui (http://localhost:5000)

---

**Prochaine étape** : 
Tester l'inscription et partager les logs pour diagnostic ! 🔍
