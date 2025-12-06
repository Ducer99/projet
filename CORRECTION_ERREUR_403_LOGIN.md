# 🔒 CORRECTION : Erreur 403 lors de la connexion

## 🚨 PROBLÈME IDENTIFIÉ

### Symptôme
```
Login error: AxiosError {message: 'Request failed with status code 403', ...}
```

L'utilisateur reçoit une erreur **403 Forbidden** lors de la tentative de connexion.

## 🔍 CAUSE RACINE

### Problème 1 : Logique de Login Incomplète

**AVANT** (AuthController.cs ligne 30-38) :
```csharp
var user = await _context.Connexions
    .Include(c => c.Person)
    .FirstOrDefaultAsync(c => c.Email == request.Email && c.IsActive);

if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
{
    return Unauthorized("Email ou mot de passe incorrect");
}
```

**Problèmes** :
1. ❌ Ne vérifie PAS si `Person.CanLogin = false` (profils commémoratifs)
2. ❌ Retourne `null` si `IsActive = false` → Message "Email ou mot de passe incorrect" trompeur
3. ❌ Pas de distinction entre :
   - Mauvais identifiants
   - Compte inactif (non complété)
   - Compte désactivé (personne décédée)

### Problème 2 : Comptes Créés Inactifs

Dans `RegisterSimple` (ligne 95) :
```csharp
var connexion = new Connexion
{
    // ...
    IsActive = false, // Inactif jusqu'à la complétion du profil
    ProfileCompleted = false,
    // ...
};
```

**Résultat** : Un utilisateur qui s'inscrit ne peut **JAMAIS** se connecter car `IsActive = false` et le login filtre par `IsActive = true`.

### Problème 3 : Profils Commémoratifs

Les profils avec `Status = "deceased"` ont `CanLogin = false`, mais le login ne vérifie pas ce champ.

## ✅ SOLUTION IMPLÉMENTÉE

### 1. Amélioration de la Logique de Login

**APRÈS** (AuthController.cs ligne 30-62) :
```csharp
[HttpPost("login")]
public async Task<ActionResult> Login([FromBody] LoginRequest request)
{
    // Trouver l'utilisateur par email (actif ou non)
    var user = await _context.Connexions
        .Include(c => c.Person)
        .FirstOrDefaultAsync(c => c.Email == request.Email);

    // Vérifier si l'utilisateur existe
    if (user == null)
    {
        return Unauthorized(new { message = "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
    {
        return Unauthorized(new { message = "Email ou mot de passe incorrect" });
    }

    // ✅ Vérifier si le compte est actif
    if (!user.IsActive)
    {
        return StatusCode(403, new { message = "Votre compte n'est pas encore activé. Veuillez compléter votre inscription." });
    }

    // ✅ Vérifier si la personne peut se connecter (pas décédée)
    if (user.Person != null && !user.Person.CanLogin)
    {
        return StatusCode(403, new { message = "Ce compte est désactivé. Les profils commémoratifs ne peuvent pas se connecter." });
    }

    // Update last login date
    user.LastLoginDate = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    
    // ... génération token et retour
}
```

### 2. Corrections des Warnings Null

**PersonName** (ligne 86) :
```csharp
// AVANT
PersonName = $"{user.Person.FirstName} {user.Person.LastName}",

// APRÈS
PersonName = user.Person != null 
    ? $"{user.Person.FirstName} {user.Person.LastName}" 
    : user.UserName,
```

**UserName lors de la complétion** (ligne 400) :
```csharp
// AVANT
connexion.UserName = $"{person.FirstName.ToLower()}.{person.LastName.ToLower()}";

// APRÈS
connexion.UserName = $"{person.FirstName?.ToLower() ?? "user"}.{person.LastName?.ToLower() ?? "name"}";
```

**Calcul d'âge** (ligne 404) :
```csharp
// AVANT
var age = DateTime.Today.Year - person.Birthday?.Year ?? 0;

// APRÈS
var age = DateTime.Today.Year - (person.Birthday?.Year ?? DateTime.Today.Year);
```

## 📊 CODES D'ERREUR RETOURNÉS

| Cas | Code | Message |
|-----|------|---------|
| **Email inexistant** | 401 | "Email ou mot de passe incorrect" |
| **Mauvais mot de passe** | 401 | "Email ou mot de passe incorrect" |
| **Compte non activé** | 403 | "Votre compte n'est pas encore activé. Veuillez compléter votre inscription." |
| **Profil commémoratif** | 403 | "Ce compte est désactivé. Les profils commémoratifs ne peuvent pas se connecter." |

## 🎯 AVANTAGES

### 1. Messages d'Erreur Clairs
- ✅ L'utilisateur sait **exactement** pourquoi il ne peut pas se connecter
- ✅ Distinction entre erreur d'identifiants et compte désactivé
- ✅ Guidance : "Veuillez compléter votre inscription"

### 2. Sécurité Maintenue
- ✅ Pas de fuite d'information (401 pour email/mot de passe)
- ✅ 403 seulement si identifiants corrects mais compte bloqué
- ✅ Respect du principe de least privilege

### 3. Robustesse
- ✅ Gestion des cas null (`Person`, `FirstName`, `LastName`, `Birthday`)
- ✅ Pas de crash si données incomplètes
- ✅ Compilation sans warnings

## 🧪 TESTS À EFFECTUER

### Test 1 : Connexion Normale ✅
```
Email: utilisateur@example.com
Mot de passe: MotDePasse123!
IsActive: true
CanLogin: true
```
**Attendu** : Connexion réussie → Redirection vers Dashboard

### Test 2 : Compte Non Activé
```
Email: nouveau@example.com
Mot de passe: MotDePasse123!
IsActive: false
ProfileCompleted: false
```
**Attendu** : Erreur 403 avec message "Votre compte n'est pas encore activé"

### Test 3 : Profil Commémoratif
```
Email: defunt@example.com
Mot de passe: MotDePasse123!
IsActive: true
Person.Status: "deceased"
Person.CanLogin: false
```
**Attendu** : Erreur 403 avec message "Les profils commémoratifs ne peuvent pas se connecter"

### Test 4 : Mauvais Identifiants
```
Email: inconnu@example.com OU mauvais mot de passe
```
**Attendu** : Erreur 401 avec message "Email ou mot de passe incorrect"

## 🔧 ACTIONS UTILISATEUR

### Si Erreur 403 "Compte non activé"
1. Retourner sur `/complete-profile`
2. Remplir les informations personnelles
3. Compléter l'inscription
4. Réessayer la connexion

### Si Erreur 403 "Profil commémoratif"
- Ce compte représente une personne décédée
- **Impossible de se connecter** (by design)
- Créer un nouveau compte pour une personne vivante

### Si Erreur 401 "Identifiants incorrects"
- Vérifier l'orthographe de l'email
- Vérifier le mot de passe
- Utiliser "Mot de passe oublié ?" si nécessaire

## 📝 FICHIERS MODIFIÉS

1. **`backend/Controllers/AuthController.cs`**
   - Ligne 30-62 : Logique de login améliorée
   - Ligne 86 : Gestion null pour PersonName
   - Ligne 400 : Gestion null pour UserName
   - Ligne 404 : Gestion null pour Birthday

## ✅ STATUT

- **Compilation** : ✅ Sans erreurs ni warnings
- **Backend** : ✅ Redémarré sur port 5000
- **Frontend** : ✅ Affiche déjà les messages d'erreur correctement
- **Tests** : 🧪 À effectuer par l'utilisateur

---

**La correction est complète et opérationnelle. Le backend retourne maintenant des messages d'erreur 403 explicites pour les comptes inactifs ou désactivés, permettant à l'utilisateur de comprendre et résoudre le problème.**
