# 🔄 Cohérence du Système de Placeholder Parent

## 📋 Résumé

Ce document récapitule **tous les endroits** où le système de placeholder parent a été implémenté pour garantir une expérience cohérente à travers toute l'application.

## ✅ Endroits mis à jour

### 1. **CompleteProfile.tsx** - Inscription Initiale
**Localisation** : `frontend/src/pages/CompleteProfile.tsx`

**Fonctionnalité** :
- Formulaire de complétion de profil lors de la première connexion
- Saisie manuelle uniquement (pas de dropdown)
- Champs séparés pour prénom/nom du père et de la mère

**Implémentation** :
```typescript
// États
const [fatherFirstName, setFatherFirstName] = useState('');
const [fatherLastName, setFatherLastName] = useState('');
const [motherFirstName, setMotherFirstName] = useState('');
const [motherLastName, setMotherLastName] = useState('');

// Payload API
fatherFirstName, fatherLastName,
motherFirstName, motherLastName
```

**Endpoint Backend** : `POST /api/auth/complete-profile`
- Méthode : `FindOrCreateParentPlaceholder()`
- Crée des placeholders si nécessaire

---

### 2. **EditMember.tsx** - Modification de Membre Existant
**Localisation** : `frontend/src/pages/EditMember.tsx`

**Fonctionnalité** :
- Formulaire d'édition d'un membre de la famille
- **Dual-mode** : Toggle entre dropdown et saisie manuelle
- Boutons de basculement pour choisir le mode

**Implémentation** :
```typescript
// États de mode
const [fatherMode, setFatherMode] = useState<'select' | 'manual'>('select');
const [motherMode, setMotherMode] = useState<'select' | 'manual'>('select');

// États de saisie manuelle
const [fatherFirstName, setFatherFirstName] = useState('');
const [fatherLastName, setFatherLastName] = useState('');
const [motherFirstName, setMotherFirstName] = useState('');
const [motherLastName, setMotherLastName] = useState('');
```

**Endpoint Backend** : `PUT /api/persons/{id}`
- DTO : `UpdatePersonDto`
- Méthode : `FindOrCreateParentPlaceholder()`

---

### 3. **AddMember.tsx** - Ajout de Nouveau Membre ✨ NOUVEAU
**Localisation** : `frontend/src/pages/AddMember.tsx`

**Fonctionnalité** :
- Formulaire d'ajout d'un nouveau membre à la famille
- **Dual-mode** : Toggle entre dropdown et saisie manuelle (même pattern que EditMember)
- Cards colorées (bleu pour père, rose pour mère)

**Implémentation** :
```typescript
// États de mode
const [fatherMode, setFatherMode] = useState<'select' | 'manual'>('manual');
const [motherMode, setMotherMode] = useState<'select' | 'manual'>('manual');

// États de saisie manuelle
const [fatherFirstName, setFatherFirstName] = useState('');
const [fatherLastName, setFatherLastName] = useState('');
const [motherFirstName, setMotherFirstName] = useState('');
const [motherLastName, setMotherLastName] = useState('');
```

**Endpoint Backend** : `POST /api/persons`
- DTO : `CreatePersonDto` (nouveau)
- Méthode : `FindOrCreateParentPlaceholderForCreate()` (nouveau)

---

### 4. **MyProfile.tsx** - Mon Profil (Lecture Seule)
**Localisation** : `frontend/src/pages/MyProfile.tsx`

**Fonctionnalité** :
- Affichage du profil personnel de l'utilisateur connecté
- **Parents en lecture seule**
- Message : "Contactez l'administrateur pour modifier les parents"

**Statut** : ✅ **Cohérent** - Pas de modification de parents (par design)

---

## 🏗️ Backend - Modifications

### AuthController.cs
**Méthode** : `CompleteProfile`
- Accepte `fatherFirstName`, `fatherLastName`, `motherFirstName`, `motherLastName`
- Appelle `FindOrCreateParentPlaceholder()` pour créer/trouver les parents

### PersonsController.cs

#### 1. DTO `CreatePersonDto` (Nouveau)
```csharp
public class CreatePersonDto
{
    // ... champs de base ...
    
    // Parents (mode dropdown)
    public int? FatherID { get; set; }
    public int? MotherID { get; set; }
    
    // Parents (mode manuel - placeholder)
    public string? FatherFirstName { get; set; }
    public string? FatherLastName { get; set; }
    public string? MotherFirstName { get; set; }
    public string? MotherLastName { get; set; }
}
```

#### 2. Méthode `PostPerson` (Modifiée)
- Accepte maintenant `CreatePersonDto` au lieu de `Person`
- Gère les parents en mode manuel ET dropdown
- Appelle `FindOrCreateParentPlaceholderForCreate()`

#### 3. Nouvelle méthode `FindOrCreateParentPlaceholderForCreate()`
```csharp
private async Task<Person> FindOrCreateParentPlaceholderForCreate(
    string firstName, 
    string lastName, 
    string sex,
    int familyId)
{
    // 1. Chercher personne confirmée existante
    // 2. Chercher placeholder existant
    // 3. Créer nouveau placeholder si nécessaire
}
```

#### 4. DTO `UpdatePersonDto` (Déjà existant)
- Déjà mis à jour avec les champs parent manuels
- Utilisé par `PutPerson`

---

## 🎨 UI/UX Pattern Commun

### Cards Colorées Parent
```tsx
{/* Père */}
<Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
  <CardBody>
    <Text fontWeight="bold" color="blue.700">👨 Père</Text>
    {/* Toggle buttons + form fields */}
  </CardBody>
</Card>

{/* Mère */}
<Card bg="pink.50" borderColor="pink.200" borderWidth={1}>
  <CardBody>
    <Text fontWeight="bold" color="pink.700">👩 Mère</Text>
    {/* Toggle buttons + form fields */}
  </CardBody>
</Card>
```

### Toggle Buttons
- **"Sélectionner dans la liste"** : Mode dropdown (fatherID/motherID)
- **"Saisir manuellement"** : Mode manuel (fatherFirstName/fatherLastName, etc.)

---

## 🔍 Logique de Recherche de Parent

### Ordre de Priorité
1. **Personne confirmée** avec nom + prénom + sexe identiques
2. **Placeholder existant** avec nom + prénom + sexe identiques
3. **Créer nouveau placeholder**

### Champs du Placeholder
```csharp
{
    FirstName = firstName,
    LastName = lastName,
    Sex = sex,
    FamilyID = familyId,
    CityID = 1, // Défaut
    Status = "placeholder",
    Alive = true,
    CreatedBy = null, // Pas de créateur pour les placeholders
    EmailVerified = false
}
```

---

## 📊 Tableau de Synthèse

| Page/Composant | Mode Parent | Backend Endpoint | DTO | Méthode Helper |
|----------------|-------------|------------------|-----|----------------|
| CompleteProfile | Manuel uniquement | POST /auth/complete-profile | CompleteProfileRequest | FindOrCreateParentPlaceholder |
| EditMember | Dual (toggle) | PUT /persons/{id} | UpdatePersonDto | FindOrCreateParentPlaceholder |
| AddMember | Dual (toggle) | POST /persons | CreatePersonDto | FindOrCreateParentPlaceholderForCreate |
| MyProfile | Lecture seule | - | - | - |

---

## 🎯 Conclusion

Le système de placeholder parent est maintenant **100% cohérent** à travers tous les formulaires de l'application :

✅ **CompleteProfile** : Saisie manuelle lors de l'inscription  
✅ **EditMember** : Dual-mode (dropdown ou manuel)  
✅ **AddMember** : Dual-mode (dropdown ou manuel)  
✅ **MyProfile** : Lecture seule (par design)  

Aucune autre page ne nécessite de modification car ce sont les seuls endroits où les parents peuvent être saisis/modifiés.

---

**Date de mise à jour** : 2025-01-XX  
**Versions concernées** : Frontend (React 18 + TypeScript), Backend (.NET Core)
