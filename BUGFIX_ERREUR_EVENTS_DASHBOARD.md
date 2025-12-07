# 🐛 BUGFIX: Erreur "Unable to load events" sur Dashboard
**Date**: 6 décembre 2025  
**Problème**: Le dashboard affichait une erreur pour charger les événements lorsqu'un nouvel utilisateur n'avait pas encore de famille

---

## 📋 Problème Identifié

### Symptômes
- Erreur "Unable to load events" (lignes 10-31)
- Dashboard ne chargeait pas les statistiques familiales
- Erreur 404 pour les utilisateurs sans famille

### Cause Racine
Trois endpoints retournaient des **erreurs 404** au lieu de **données vides** lorsqu'un utilisateur n'avait pas encore de `familyID` :

1. **`GET /api/events/upcoming`** 
   - Utilisait `familyId = 0` pour la requête SQL
   - Ne gérait pas le cas où l'utilisateur n'a pas de famille

2. **`GET /api/auth/family-info`**
   - Retournait `NotFound()` si la famille n'existait pas
   - Frontend recevait une erreur au lieu de données vides

3. **`GET /api/auth/family-stats`**
   - Retournait `NotFound()` si `user.FamilyID == null`
   - Empêchait l'affichage du dashboard

---

## ✅ Solutions Appliquées

### 1. EventsController.cs - GetUpcomingEvents
**Fichier**: `backend/Controllers/EventsController.cs`

**Avant**:
```csharp
public async Task<ActionResult> GetUpcomingEvents([FromQuery] int days = 90)
{
    var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
    var today = DateTime.UtcNow.Date;
    
    // Requête directe même si familyId = 0
    var allEvents = await _context.Events
        .Where(e => e.FamilyID == userFamilyId)
        .ToListAsync();
```

**Après**:
```csharp
public async Task<ActionResult> GetUpcomingEvents([FromQuery] int days = 90)
{
    var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
    
    // ✅ Si l'utilisateur n'a pas encore de famille, retourner un tableau vide
    if (userFamilyId == 0)
    {
        return Ok(new List<object>());
    }
    
    var today = DateTime.UtcNow.Date;
    var allEvents = await _context.Events
        .Where(e => e.FamilyID == userFamilyId)
        .ToListAsync();
```

---

### 2. AuthController.cs - GetFamilyInfo
**Fichier**: `backend/Controllers/AuthController.cs`

**Avant**:
```csharp
var family = await _context.Families
    .FirstOrDefaultAsync(f => f.FamilyID == user.FamilyID);

if (family == null)
{
    return NotFound("Famille non trouvée"); // ❌ Erreur 404
}
```

**Après**:
```csharp
// ✅ Si l'utilisateur n'a pas encore de famille, retourner des données par défaut
if (user.FamilyID == null || user.FamilyID == 0)
{
    return Ok(new
    {
        FamilyID = 0,
        FamilyName = "Aucune famille",
        Description = "",
        CreatedDate = DateTime.UtcNow,
        UserRole = user.Role,
        InviteCode = (string?)null,
        CanRegenerateCode = false
    });
}

var family = await _context.Families
    .FirstOrDefaultAsync(f => f.FamilyID == user.FamilyID);

if (family == null)
{
    return Ok(new { /* ... valeurs par défaut ... */ }); // ✅ Retour OK avec valeurs vides
}
```

---

### 3. AuthController.cs - GetFamilyStats
**Fichier**: `backend/Controllers/AuthController.cs`

**Avant**:
```csharp
var user = await _context.Connexions
    .FirstOrDefaultAsync(c => c.ConnexionID == userId);
    
if (user == null || user.FamilyID == null)
{
    return NotFound("Utilisateur ou famille non trouvé"); // ❌ Erreur 404
}
```

**Après**:
```csharp
var user = await _context.Connexions
    .FirstOrDefaultAsync(c => c.ConnexionID == userId);
    
if (user == null || user.FamilyID == null || user.FamilyID == 0)
{
    // ✅ Retourner des stats à 0 si l'utilisateur n'a pas encore de famille
    return Ok(new
    {
        MembersCount = 0,
        GenerationsCount = 0,
        PhotosCount = 0,
        EventsCount = 0,
        MarriagesCount = 0
    });
}
```

---

## 🎯 Résultat

### Comportement Attendu
Pour un utilisateur **sans famille** (`familyID = null` ou `0`) :

| Endpoint | Avant | Après |
|----------|-------|-------|
| `GET /api/events/upcoming` | ❌ Erreur 404 ou requête SQL invalide | ✅ Retourne `[]` (tableau vide) |
| `GET /api/auth/family-info` | ❌ Erreur 404 "Famille non trouvée" | ✅ Retourne objet avec valeurs par défaut |
| `GET /api/auth/family-stats` | ❌ Erreur 404 "Utilisateur ou famille non trouvé" | ✅ Retourne stats à 0 |

### Dashboard V3 - Affichage
- ✅ **Pas d'erreurs** dans la console
- ✅ Statistiques affichent **0** pour tous les compteurs
- ✅ Section "Événements à venir" affiche **Empty State** ("Aucun événement à venir")
- ✅ Famille affichée : **"Aucune famille"**
- ✅ **Pas de code d'invitation** affiché

---

## 🧪 Test de Régression

### Scénario 1: Utilisateur Sans Famille
```bash
# 1. S'inscrire avec un nouveau compte
POST /api/auth/register-simple
{
  "email": "test@example.com",
  "password": "Test1234!",
  "userName": "test.user"
}

# 2. Compléter le profil (sans rejoindre de famille)
POST /api/auth/complete-profile
{
  "firstName": "Test",
  "lastName": "User",
  "sex": "M"
}

# 3. Accéder au dashboard
GET /api/auth/family-info    → ✅ 200 OK (FamilyID = 0)
GET /api/auth/family-stats   → ✅ 200 OK (tous compteurs à 0)
GET /api/events/upcoming     → ✅ 200 OK (tableau vide [])
```

### Scénario 2: Utilisateur Avec Famille
```bash
# Après avoir rejoint une famille
POST /api/auth/attach-family
{
  "Action": "join",
  "InviteCode": "KAM-6644"
}

# Le dashboard affiche maintenant les vraies statistiques
GET /api/auth/family-info    → ✅ 200 OK (FamilyID = 1, FamilyName = "Kamoa")
GET /api/auth/family-stats   → ✅ 200 OK (statistiques réelles)
GET /api/events/upcoming     → ✅ 200 OK (événements familiaux)
```

---

## 📝 Recommandations

### Pour l'Avenir
1. **Toujours retourner 200 OK** avec données vides au lieu de 404 pour les ressources optionnelles
2. **Vérifier `familyID == 0`** en plus de `familyID == null`
3. **Ajouter des tests unitaires** pour les cas "utilisateur sans famille"
4. **Frontend**: Afficher un CTA "Rejoindre une famille" si `familyID == 0`

### Points d'Attention
- Les JWT tokens pour nouveaux utilisateurs ont `familyId = 0` jusqu'au rattachement
- Le claim `familyId` est mis à jour après `attach-family`
- Dashboard V3 gère déjà l'Empty State pour les données vides

---

## 🚀 Déploiement

```bash
# 1. Redémarrer le backend pour appliquer les corrections
cd backend
dotnet run

# 2. Tester avec un nouveau compte
# 3. Vérifier qu'aucune erreur n'apparaît dans la console
# 4. Confirmer que le dashboard affiche "Aucune famille" et stats à 0
```

---

## ✅ Validation Finale

- [x] Backend redémarré avec corrections
- [x] Endpoints retournent 200 OK au lieu de 404
- [x] Dashboard affiche sans erreurs pour utilisateurs sans famille
- [x] Empty State visible pour événements/mariages
- [x] Token JWT contient bien `familyId = 0` pour nouveaux utilisateurs
- [x] Après `attach-family`, le dashboard affiche les vraies données

**Status**: ✅ **RÉSOLU** - Le dashboard fonctionne maintenant pour tous les utilisateurs, avec ou sans famille.
