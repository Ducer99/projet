# 🔄 Mise à jour : Système de Parents Placeholder dans EditMember

## 📋 Résumé des Modifications

Le formulaire de modification de membre (`EditMember.tsx`) a été amélioré pour supporter le système de parents "placeholder", offrant plus de flexibilité aux utilisateurs.

## 🎯 Problème Résolu

**Avant :** Les utilisateurs ne pouvaient sélectionner les parents que parmi une liste déroulante (dropdown) des membres déjà inscrits dans la famille.

**Limitation :** Si un parent n'était pas encore inscrit, il était impossible de le renseigner.

**Après :** Les utilisateurs peuvent maintenant choisir entre :
1. **Sélectionner dans la liste** (mode dropdown) → Pour les parents déjà inscrits
2. **Saisir manuellement** (mode manuel) → Pour créer un placeholder si le parent n'est pas encore inscrit

## 🎨 Interface Utilisateur

### Mode Sélection (Select)
```
┌─────────────────────────────────────────────────────┐
│ Père                    [Choisir dans la liste] [Saisir manuellement] │
│                                                      │
│ [▼ -- Aucun père --                            ]    │
│    Jean DUPONT (45 ans)                             │
│    Pierre MARTIN (52 ans) ✝️                        │
└─────────────────────────────────────────────────────┘
```

### Mode Manuel (Manual)
```
┌─────────────────────────────────────────────────────┐
│ Père                    [Choisir dans la liste] [Saisir manuellement] │
│                                                      │
│ ℹ️ Un profil temporaire sera créé pour ce parent.  │
│    Il pourra le réclamer en s'inscrivant plus tard. │
│                                                      │
│ ┌─────────────────┐  ┌─────────────────────────┐   │
│ │ Prénom          │  │ Nom                     │   │
│ │ [Jean         ] │  │ [DUPONT               ] │   │
│ └─────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🔧 Changements Techniques

### Frontend (`EditMember.tsx`)

#### 1. Nouveaux États
```typescript
// Mode de saisie des parents (dropdown ou manuel)
const [fatherMode, setFatherMode] = useState<'select' | 'manual'>('select');
const [motherMode, setMotherMode] = useState<'select' | 'manual'>('select');

// Champs pour la saisie manuelle
const [fatherFirstName, setFatherFirstName] = useState('');
const [fatherLastName, setFatherLastName] = useState('');
const [motherFirstName, setMotherFirstName] = useState('');
const [motherLastName, setMotherLastName] = useState('');
```

#### 2. Logique de Soumission
```typescript
const payload: any = {
  // ... champs standards ...
};

// Gérer les parents selon le mode
if (fatherMode === 'select') {
  payload.fatherID = fatherID || null;
} else {
  // Mode manuel : envoyer les noms pour créer un placeholder
  payload.fatherFirstName = fatherFirstName || null;
  payload.fatherLastName = fatherLastName || null;
}
```

#### 3. Boutons de Basculement
```tsx
<HStack spacing={2}>
  <Button
    size="xs"
    variant={fatherMode === 'select' ? 'solid' : 'outline'}
    colorScheme="blue"
    onClick={() => setFatherMode('select')}
  >
    {t('editMember.selectFromList')}
  </Button>
  <Button
    size="xs"
    variant={fatherMode === 'manual' ? 'solid' : 'outline'}
    colorScheme="blue"
    onClick={() => setFatherMode('manual')}
  >
    {t('editMember.enterManually')}
  </Button>
</HStack>
```

### Backend (`PersonsController.cs`)

#### 1. Nouveau DTO
```csharp
public class UpdatePersonDto
{
    // Champs standards
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    // ...
    
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

#### 2. Méthode PUT Mise à Jour
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> PutPerson(int id, UpdatePersonDto personUpdate)
{
    // ...
    
    // Gérer les parents (placeholder ou existants)
    int? fatherId = personUpdate.FatherID;
    
    // Si des noms de parents sont fournis en mode manuel, créer des placeholders
    if (!string.IsNullOrEmpty(personUpdate.FatherFirstName) && 
        !string.IsNullOrEmpty(personUpdate.FatherLastName))
    {
        var fatherPlaceholder = await FindOrCreateParentPlaceholder(
            personUpdate.FatherFirstName,
            personUpdate.FatherLastName,
            "M",
            existingPerson.CityID,
            userConnexionId
        );
        fatherId = fatherPlaceholder?.PersonID;
    }
    
    existingPerson.FatherID = fatherId;
    // ...
}
```

#### 3. Méthode Réutilisée
```csharp
private async Task<Person?> FindOrCreateParentPlaceholder(
    string firstName, 
    string lastName, 
    string sex, 
    int cityId,
    int createdBy)
{
    // 1. Vérifier si un utilisateur actif existe déjà
    // 2. Vérifier si un placeholder existe déjà
    // 3. Créer un nouveau placeholder si nécessaire
}
```

## 🌍 Traductions

### Français (`fr.json`)
```json
"editMember": {
  "selectFromList": "Choisir dans la liste",
  "enterManually": "Saisir manuellement",
  "placeholderWillBeCreated": "Un profil temporaire sera créé pour ce parent. Il pourra le réclamer en s'inscrivant plus tard."
}
```

### Anglais (`en.json`)
```json
"editMember": {
  "selectFromList": "Select from list",
  "enterManually": "Enter manually",
  "placeholderWillBeCreated": "A temporary profile will be created for this parent. They can claim it by registering later."
}
```

## 📊 Flux de Données

```
┌──────────────┐
│  Utilisateur │
└──────┬───────┘
       │
       │ Sélectionne mode "Saisir manuellement"
       ↓
┌──────────────────────────────┐
│  Frontend: EditMember.tsx    │
│  - Affiche champs Prénom/Nom │
│  - Valide la saisie          │
└──────┬───────────────────────┘
       │
       │ POST /api/persons/{id}
       │ {
       │   fatherFirstName: "Jean",
       │   fatherLastName: "DUPONT"
       │ }
       ↓
┌────────────────────────────────────────┐
│  Backend: PersonsController.PutPerson  │
│  1. Reçoit UpdatePersonDto             │
│  2. Détecte mode manuel                │
│  3. Appelle FindOrCreateParentPlaceholder│
└──────┬─────────────────────────────────┘
       │
       ↓
┌────────────────────────────────────────┐
│  FindOrCreateParentPlaceholder         │
│  1. Cherche personne active            │
│  2. Cherche placeholder existant       │
│  3. Crée nouveau placeholder si besoin │
└──────┬─────────────────────────────────┘
       │
       │ Retourne Person ID
       ↓
┌────────────────────────────────────────┐
│  Base de Données                       │
│  UPDATE Person                         │
│  SET FatherID = {placeholder_id}       │
│  WHERE PersonID = {id}                 │
└────────────────────────────────────────┘
```

## ✅ Cas d'Usage

### Cas 1: Parent Déjà Inscrit
```
1. Utilisateur ouvre "Modifier le profil" de Lucas
2. Sélectionne mode "Choisir dans la liste"
3. Sélectionne "Pierre DUPONT" dans le dropdown
4. Sauvegarde → Lucas.FatherID = 3 (ID de Pierre)
```

### Cas 2: Parent Non-Inscrit
```
1. Utilisateur ouvre "Modifier le profil" de Lucas
2. Sélectionne mode "Saisir manuellement"
3. Saisit "Jean" + "DUPONT"
4. Sauvegarde →
   a. Système vérifie si "Jean DUPONT" existe
   b. Si non → Crée placeholder (ID: 15)
   c. Lucas.FatherID = 15 (ID du placeholder)
```

### Cas 3: Parent S'inscrit Plus Tard
```
1. Jean DUPONT s'inscrit avec email/mdp
2. Complète son profil (prénom: Jean, nom: DUPONT)
3. Backend détecte placeholder existant
4. Propose réclamation (TODO: à implémenter)
5. Jean confirme → placeholder devient actif
6. Lucas.FatherID = 15 (toujours le même ID, mais maintenant actif)
```

## 🚀 Avantages

1. **Flexibilité Maximale**
   - Utilisateurs peuvent choisir le mode qui leur convient
   - Aucune perte de données même si le parent n'est pas inscrit

2. **UX Cohérente**
   - Même logique que CompleteProfile
   - Messages d'aide clairs
   - Indication visuelle du mode actif

3. **Pas de Duplication**
   - Vérification avant création de placeholder
   - Réutilisation des placeholders existants

4. **Extensible**
   - Facile d'ajouter d'autres modes (ex: recherche avancée)
   - Compatible avec le système de claiming (à venir)

## 📝 Prochaines Étapes

- [ ] Implémenter le claiming automatique lors de l'inscription
- [ ] Afficher les placeholders avec un badge distinct dans la liste
- [ ] Permettre la conversion manuelle placeholder → confirmé
- [ ] Notification quand un placeholder est réclamé

## 🐛 Points d'Attention

1. **Validation Côté Frontend**
   - En mode manuel, les deux champs (prénom + nom) doivent être remplis
   - Vérifier avant la soumission

2. **Permissions**
   - Seuls Admin, Créateur ou la personne elle-même peuvent modifier
   - Vérification maintenue dans le backend

3. **CityID**
   - Le placeholder hérite du CityID de la personne éditée
   - Peut être affiné plus tard si besoin

---

**Date:** 6 novembre 2025  
**Version:** 1.0  
**Auteur:** GitHub Copilot
