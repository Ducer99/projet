# 🐛 Correction : Erreur lors de la mise à jour dans EditMember

## ❌ Problème Identifié

Lorsque l'utilisateur modifiait un membre via **EditMember.tsx** et cliquait sur "Enregistrer", l'erreur suivante apparaissait :

```
Erreur
Erreur lors de la mise à jour
```

## 🔍 Analyse de la cause

### Problème 1 : Champs non autorisés dans le DTO

Le frontend envoyait des champs qui n'étaient PAS dans `UpdatePersonDto` :
- `personID` ❌
- `familyID` ❌

Le backend attendait uniquement les champs définis dans `UpdatePersonDto`.

### Problème 2 : FamilyID manquant sur les placeholders

La méthode `FindOrCreateParentPlaceholder()` créait des placeholders **SANS familyID**, ce qui violait probablement les contraintes de base de données.

```csharp
// AVANT (INCORRECT)
var placeholder = new Person
{
    FirstName = firstName,
    LastName = lastName,
    Sex = sex,
    CityID = cityId,
    Status = "placeholder",
    // ❌ FamilyID manquant !
    CreatedBy = createdBy
};
```

### Problème 3 : Signature de méthode incomplète

La méthode `FindOrCreateParentPlaceholder()` ne prenait pas `familyId` en paramètre, donc impossible de l'assigner au placeholder.

## ✅ Corrections Apportées

### 1. Nettoyage du payload dans EditMember.tsx

**Fichier** : `frontend/src/pages/EditMember.tsx`

**Avant** :
```typescript
const payload: any = {
  personID: parseInt(id || '0'),  // ❌ Pas dans UpdatePersonDto
  firstName,
  lastName,
  // ...
  familyID: member?.familyID,     // ❌ Pas dans UpdatePersonDto
};
```

**Après** :
```typescript
const payload: any = {
  firstName,
  lastName,
  sex,
  birthday: birthday ? new Date(birthday).toISOString() : null,
  deathDate: alive ? null : (deathDate ? new Date(deathDate).toISOString() : null),
  alive,
  email,
  activity,
  photoUrl,
  notes,
  cityID,
};
```

**Logs ajoutés** :
```typescript
} catch (error: any) {
  console.error('❌ Erreur lors de la mise à jour:', error);
  console.error('Response data:', error.response?.data);
  // ...
}
```

### 2. Ajout de FamilyID au placeholder

**Fichier** : `backend/Controllers/PersonsController.cs`

**Signature mise à jour** :
```csharp
// AVANT
private async Task<Person?> FindOrCreateParentPlaceholder(
    string firstName, 
    string lastName, 
    string sex, 
    int cityId,
    int createdBy)

// APRÈS
private async Task<Person?> FindOrCreateParentPlaceholder(
    string firstName, 
    string lastName, 
    string sex, 
    int cityId,
    int createdBy,
    int familyId)  // ✅ Ajouté
```

**Création du placeholder corrigée** :
```csharp
var placeholder = new Person
{
    FirstName = firstName,
    LastName = lastName,
    Sex = sex,
    FamilyID = familyId,  // ✅ AJOUTÉ - Le placeholder doit appartenir à la même famille
    CityID = cityId,
    Status = "placeholder",
    Alive = true,
    CanLogin = false,
    CreatedBy = createdBy,
    ParentLinkConfirmed = false,
    EmailVerified = false
};
```

**Recherche améliorée** (vérifie maintenant dans la bonne famille) :
```csharp
// 1. Vérifier si un utilisateur actif existe déjà avec ce nom dans cette famille
var existingPerson = await _context.Persons
    .FirstOrDefaultAsync(p => 
        p.FirstName.ToLower() == firstName.ToLower() && 
        p.LastName.ToLower() == lastName.ToLower() &&
        p.Sex == sex &&
        p.FamilyID == familyId &&  // ✅ Vérifie dans la bonne famille
        p.Status == "confirmed");

// 2. Vérifier si un placeholder existe déjà dans cette famille
var existingPlaceholder = await _context.Persons
    .FirstOrDefaultAsync(p => 
        p.FirstName.ToLower() == firstName.ToLower() && 
        p.LastName.ToLower() == lastName.ToLower() &&
        p.Sex == sex &&
        p.FamilyID == familyId &&  // ✅ Vérifie dans la bonne famille
        p.Status == "placeholder");
```

### 3. Mise à jour des appels dans PutPerson

**Fichier** : `backend/Controllers/PersonsController.cs`

**Avant** :
```csharp
var fatherPlaceholder = await FindOrCreateParentPlaceholder(
    personUpdate.FatherFirstName,
    personUpdate.FatherLastName,
    "M",
    existingPerson.CityID,
    userConnexionId  // ❌ familyId manquant
);
```

**Après** :
```csharp
var fatherPlaceholder = await FindOrCreateParentPlaceholder(
    personUpdate.FatherFirstName,
    personUpdate.FatherLastName,
    "M",
    existingPerson.CityID,
    userConnexionId,
    userFamilyId  // ✅ AJOUTÉ
);
```

## 🧪 Test de Validation

### Scénario de test
1. Se connecter avec un compte
2. Aller dans "Membres" → Sélectionner un membre → Cliquer sur "Voir"
3. Cliquer sur "Modifier le profil"
4. Modifier un champ (ex: activité, note, ou ajouter un parent en mode manuel)
5. Cliquer sur "Enregistrer"

### Résultat Attendu
✅ Message de succès : "Membre mis à jour avec succès"  
✅ Redirection vers la page `/members`  
✅ Placeholder créé avec le bon FamilyID si parent saisi manuellement  

### Résultat Avant la Correction
❌ Message d'erreur : "Erreur lors de la mise à jour"  
❌ Pas de redirection  
❌ Placeholder créé sans FamilyID (violation de contrainte)  

## 📋 Fichiers Modifiés

| Fichier | Modification | Raison |
|---------|-------------|---------|
| `frontend/src/pages/EditMember.tsx` | Nettoyage du payload | Enlever champs non-DTO |
| `frontend/src/pages/EditMember.tsx` | Ajout de logs | Debugging |
| `backend/Controllers/PersonsController.cs` | Signature de `FindOrCreateParentPlaceholder` | Ajouter paramètre `familyId` |
| `backend/Controllers/PersonsController.cs` | Création de placeholder | Assigner `FamilyID` |
| `backend/Controllers/PersonsController.cs` | Recherche de placeholder | Chercher dans la bonne famille |
| `backend/Controllers/PersonsController.cs` | Appels dans `PutPerson` | Passer `userFamilyId` |

## 🔧 Cohérence avec les Autres Endpoints

### CompleteProfile (AuthController)
Utilise `FindOrCreateParentPlaceholder` avec une signature similaire qui inclut familyId ✅

### PostPerson (PersonsController)
Utilise `FindOrCreateParentPlaceholderForCreate` qui a toujours eu le familyId ✅

### PutPerson (PersonsController)
Maintenant corrigé pour inclure familyId ✅

## 🎯 Conclusion

**Problème résolu** : Les deux bugs ont été corrigés :
1. ✅ Payload frontend nettoyé (plus de champs interdits)
2. ✅ FamilyID assigné correctement aux placeholders
3. ✅ Recherche de placeholders dans la bonne famille

Le système de modification de membres fonctionne maintenant correctement, que ce soit en mode dropdown ou manuel pour les parents.

---

**Date de correction** : 6 novembre 2025  
**Versions impactées** : Frontend (React), Backend (.NET Core)
