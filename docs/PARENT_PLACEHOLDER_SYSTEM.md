# 👨‍👩‍👦 Système de Parents "Placeholder" (Fantômes)

## 🎯 Objectif

Permettre aux utilisateurs de renseigner leurs parents lors de l'inscription, même si ceux-ci ne sont pas encore inscrits. Le système crée automatiquement des nœuds "placeholder" qui pourront être réclamés plus tard.

## 📋 Flux Utilisateur

### 1. Inscription Initiale (Utilisateur A)

```
┌─────────────────────────────────────────────────────┐
│ Étape 1: Créer un compte (Email + Mot de passe)    │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ Étape 2: Compléter le profil                       │
│                                                     │
│ • Informations personnelles                        │
│ • Date de naissance                                │
│ • Lieu de naissance                                │
│ • ✨ NOUVEAU: Informations parents (optionnel)     │
│   - Prénom + Nom du père                          │
│   - Prénom + Nom de la mère                       │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ Traitement Backend                                  │
│                                                     │
│ Pour chaque parent renseigné:                      │
│ 1. Vérifier si une personne active existe          │
│    (même nom + prénom + sexe + status=confirmed)   │
│                                                     │
│ 2. Si OUI → Lier directement                       │
│    Exemple: Le père est déjà inscrit               │
│                                                     │
│ 3. Si NON → Vérifier si un placeholder existe      │
│    (même nom + prénom + sexe + status=placeholder) │
│                                                     │
│ 4. Si placeholder existe → Lier au placeholder     │
│    Exemple: Un frère a déjà créé ce placeholder    │
│                                                     │
│ 5. Si aucun → Créer nouveau placeholder            │
│    • Status = "placeholder"                        │
│    • CanLogin = false                              │
│    • CreatedBy = ID de l'utilisateur A             │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ Résultat: Arbre généalogique créé                  │
│                                                     │
│ Utilisateur A (Confirmé)                           │
│    ├── FatherID → Parent B (Placeholder)          │
│    └── MotherID → Parent C (Placeholder)          │
└─────────────────────────────────────────────────────┘
```

### 2. Inscription du Parent (Parent B)

```
┌─────────────────────────────────────────────────────┐
│ Parent B s'inscrit plus tard                       │
│                                                     │
│ 1. Créer compte (Email + Mot de passe)            │
│ 2. Compléter profil (Prénom + Nom + ...)          │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ Vérification Automatique (Backend)                 │
│                                                     │
│ SELECT * FROM Person                               │
│ WHERE FirstName = 'Jean'                           │
│   AND LastName = 'DUPONT'                          │
│   AND Sex = 'M'                                    │
│   AND Status = 'placeholder'                       │
└─────────────────────────────────────────────────────┘
                     ↓
          ┌─────────┴─────────┐
          │                   │
     Aucun trouvé        Placeholder trouvé
          │                   │
          ↓                   ↓
┌─────────────────┐  ┌──────────────────────────────┐
│ Créer nouveau   │  │ Proposition de réclamation   │
│ profil normal   │  │                              │
└─────────────────┘  │ "Nous avons trouvé un profil │
                     │  qui vous correspond :       │
                     │  - Créé par: Pierre Dupont   │
                     │  - Date: 15 mars 2024        │
                     │                              │
                     │  Est-ce vous ?"              │
                     │  [Oui, c'est moi] [Non]      │
                     └──────────────────────────────┘
                                  ↓
                     ┌────────────────────────────────┐
                     │ Si OUI → Claiming              │
                     │                                │
                     │ UPDATE Person                  │
                     │ SET Status = 'confirmed'       │
                     │     CanLogin = true            │
                     │ WHERE PersonID = placeholder   │
                     │                                │
                     │ UPDATE Connexion               │
                     │ SET IDPerson = placeholder.ID  │
                     │ WHERE Email = parent_email     │
                     └────────────────────────────────┘
                                  ↓
                     ┌────────────────────────────────┐
                     │ Résultat: Liens préservés     │
                     │                                │
                     │ Parent B (Confirmé maintenant) │
                     │    ↑                           │
                     │    │                           │
                     │ Utilisateur A (son enfant)     │
                     │    └── FatherID pointe vers B  │
                     └────────────────────────────────┘
```

## 🗄️ Structure de Données

### Table Person

| Champ | Type | Description |
|-------|------|-------------|
| PersonID | INT | Identifiant unique |
| FirstName | VARCHAR | Prénom |
| LastName | VARCHAR | Nom |
| Sex | CHAR(1) | "M" ou "F" |
| Status | VARCHAR | **"confirmed"** (actif) ou **"placeholder"** (fantôme) |
| CanLogin | BOOLEAN | **false** pour placeholder, **true** pour confirmé |
| CreatedBy | INT | ID de l'utilisateur qui a créé ce nœud |
| FatherID | INT | Pointe vers le père (peut être placeholder) |
| MotherID | INT | Pointe vers la mère (peut être placeholder) |

### Exemple de Données

```sql
-- Utilisateur A s'inscrit et renseigne ses parents
INSERT INTO Person (FirstName, LastName, Sex, Status, CanLogin, CreatedBy, FatherID, MotherID)
VALUES 
  -- Parent placeholder (père)
  ('Jean', 'DUPONT', 'M', 'placeholder', false, NULL, NULL, NULL), -- ID 1
  
  -- Parent placeholder (mère)
  ('Marie', 'MARTIN', 'F', 'placeholder', false, NULL, NULL, NULL), -- ID 2
  
  -- Utilisateur A
  ('Pierre', 'DUPONT', 'M', 'confirmed', true, 3, 1, 2); -- ID 3, créé par lui-même

-- Plus tard, le père (Jean) s'inscrit
-- Le système détecte le placeholder ID=1 et propose le claiming
UPDATE Person 
SET Status = 'confirmed', CanLogin = true
WHERE PersonID = 1;

-- Résultat: Pierre (ID=3) reste lié à son père Jean (ID=1)
-- Mais Jean est maintenant actif et peut se connecter !
```

## 🔍 Algorithme de Matching

### Critères de correspondance

```csharp
// 1. Recherche exacte (personne active)
var existingPerson = await _context.Persons
    .FirstOrDefaultAsync(p => 
        p.FirstName.ToLower() == firstName.ToLower() && 
        p.LastName.ToLower() == lastName.ToLower() &&
        p.Sex == sex &&
        p.Status == "confirmed");

// 2. Recherche placeholder
var existingPlaceholder = await _context.Persons
    .FirstOrDefaultAsync(p => 
        p.FirstName.ToLower() == firstName.ToLower() && 
        p.LastName.ToLower() == lastName.ToLower() &&
        p.Sex == sex &&
        p.Status == "placeholder");

// 3. Création nouveau placeholder
if (existingPerson == null && existingPlaceholder == null)
{
    var placeholder = new Person
    {
        FirstName = firstName,
        LastName = lastName,
        Sex = sex,
        Status = "placeholder",
        CanLogin = false,
        CreatedBy = currentUserId
    };
}
```

## ✅ Avantages du Système

1. **Arbre généalogique complet immédiatement**
   - Les utilisateurs peuvent créer leur arbre dès l'inscription
   - Pas besoin d'attendre que tout le monde s'inscrive

2. **Réclamation simple**
   - Quand un parent s'inscrit, le système détecte automatiquement
   - Un seul clic pour confirmer "C'est moi"

3. **Pas de duplication**
   - Vérification avant création de placeholder
   - Réutilisation des placeholders existants

4. **Traçabilité**
   - `CreatedBy` indique qui a créé le placeholder
   - Historique de création préservé

5. **Extensible**
   - Peut être étendu avec des critères supplémentaires (date de naissance, etc.)
   - Gestion des homonymes possible

## 🚀 Prochaines Étapes (TODO)

- [ ] Interface de claiming dans le frontend
- [ ] Notification aux créateurs quand un placeholder est réclamé
- [ ] Gestion des homonymes (même nom mais personnes différentes)
- [ ] Ajout de critères supplémentaires (date de naissance, lieu, etc.)
- [ ] Historique des réclamations
- [ ] Validation par d'autres membres de la famille

## 📝 Notes Techniques

### Frontend

```typescript
// CompleteProfile.tsx
const [fatherFirstName, setFatherFirstName] = useState('');
const [fatherLastName, setFatherLastName] = useState('');
const [motherFirstName, setMotherFirstName] = useState('');
const [motherLastName, setMotherLastName] = useState('');

const payload = {
  firstName,
  lastName,
  gender,
  birthDate,
  // ... autres champs
  fatherFirstName,
  fatherLastName,
  motherFirstName,
  motherLastName
};
```

### Backend

```csharp
// AuthController.cs

[HttpPost("complete-profile")]
public async Task<ActionResult> CompleteProfile([FromBody] CompleteProfileRequest request)
{
    // Traiter le père
    Person? father = null;
    if (!string.IsNullOrEmpty(request.FatherFirstName) && !string.IsNullOrEmpty(request.FatherLastName))
    {
        father = await FindOrCreateParentPlaceholder(
            request.FatherFirstName,
            request.FatherLastName,
            "M",
            city.CityID,
            userId
        );
    }
    
    // Créer la personne avec lien vers le placeholder
    var person = new Person
    {
        // ... champs standards
        FatherID = father?.PersonID,
        MotherID = mother?.PersonID
    };
}
```

## 🎓 Cas d'Usage

### Cas 1: Famille nombreuse

```
1. Pierre s'inscrit → Crée placeholders pour ses parents
2. Marie (sa sœur) s'inscrit → Réutilise les mêmes placeholders
3. Jean (le père) s'inscrit → Réclame son placeholder
   → Devient parent de Pierre ET Marie automatiquement !
```

### Cas 2: Génération complète

```
1. Lucas (petit-fils) s'inscrit
   → Crée placeholders pour ses parents
   → Peut aussi créer placeholders pour ses grands-parents
   
2. Pierre (son père) s'inscrit
   → Réclame son placeholder
   → Voit déjà Lucas comme son fils
   → Voit déjà ses parents (les grands-parents de Lucas)
```

---

**Créé le:** 6 novembre 2025  
**Version:** 1.0  
**Auteur:** GitHub Copilot
