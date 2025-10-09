# 🔍 Clarification : PROFIL vs MEMBRE

## 🎯 Objectif

Séparer clairement :
1. **Mon Profil** (Connexion) = Mes informations personnelles
2. **Membres Famille** (Gestion) = Ajouter/Modifier d'autres personnes

---

## 📊 Structure Actuelle (Confuse)

### Routes Existantes

```tsx
// App.tsx
<Route path="/my-profile" element={<MyProfile />} />          // ✅ MON profil (moi)
<Route path="/person/:id" element={<PersonProfile />} />      // ✅ VOIR un membre
<Route path="/add-member" element={<AddMember />} />          // ⚠️ AJOUTER autre personne
<Route path="/edit-member/:id" element={<EditMember />} />    // ⚠️ MODIFIER autre personne
```

### Endpoints Backend

```csharp
// PersonsController.cs
GET /api/persons/me          // ✅ Récupérer MON profil
PUT /api/persons/me          // ✅ Modifier MON profil
GET /api/persons/{id}        // ✅ Récupérer un membre
POST /api/persons            // ⚠️ Créer un membre (utilisé par AddMember ET CompleteProfile)
PUT /api/persons/{id}        // ⚠️ Modifier un membre quelconque
```

---

## 🔴 Problème Identifié

### Confusion 1 : "Ajouter un membre" vs "Mes informations"

**Dashboard** affiche :
```tsx
<Button onClick={() => navigate('/add-member')}>
  Ajouter un membre 👤
</Button>
```

❓ **Question utilisateur** : "Ajouter un membre" = Ajouter QUI ?
- ✅ Moi-même (première connexion) ?
- ✅ Un parent (père, mère) ?
- ✅ Un enfant ?
- ✅ Un conjoint ?

→ **Réponse** : L'utilisateur pense que `/add-member` sert à ajouter **D'AUTRES PERSONNES** (famille).

### Confusion 2 : CompleteProfile vs AddMember

**CompleteProfile.tsx** :
- Utilisé **après inscription** (profil vide)
- Demande prénom, nom, sexe, ville...
- **Crée** l'enregistrement Person avec `POST /api/persons`

**AddMember.tsx** :
- Utilisé **depuis Dashboard** (bouton "Ajouter un membre")
- Même formulaire que CompleteProfile
- **Crée AUSSI** un Person avec `POST /api/persons`

→ **Doublon fonctionnel** !

---

## ✅ Solution Proposée

### Architecture Clarifiée

```
┌─────────────────────────────────────────────────────────┐
│                    APRÈS INSCRIPTION                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │ CompleteProfile │ (Obligatoire)
                  │ Mes infos de    │
                  │ base            │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Dashboard     │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│  Mon Profil   │  │ Voir Membres │  │ Arbre Généa  │
│ (Moi seul)    │  │ (Lecture)    │  │ (Visualiser) │
└───────┬───────┘  └──────┬───────┘  └──────────────┘
        │                  │
        ▼                  ▼
┌───────────────┐  ┌──────────────┐
│ Modifier Mes  │  │ PersonProfile│
│ Informations  │  │ (Lecture +   │
│               │  │  Édition si  │
│               │  │  droits)     │
└───────────────┘  └──────┬───────┘
                           │
                           ▼
                   ┌──────────────┐
                   │ Modifier     │
                   │ Membre       │
                   │ (Si droits)  │
                   └──────────────┘
```

---

## 📝 Terminologie Corrigée

### 1️⃣ **MON PROFIL** (Connexion)

**Route** : `/my-profile`  
**Composant** : `MyProfile.tsx`  
**API** : `GET /api/persons/me`, `PUT /api/persons/me`  
**Description** : L'utilisateur connecté modifie **SES PROPRES** informations.

**Restrictions** :
- ❌ Pas de modification `FatherID`, `MotherID`, `FamilyID` (sécurité)
- ✅ Modification prénom, nom, email, profession, bio, ville

**Bouton Dashboard** :
```tsx
<Button onClick={() => navigate('/my-profile')}>
  Mon Profil 👤
</Button>
```

---

### 2️⃣ **PROFIL D'UN MEMBRE** (Consultation)

**Route** : `/person/:id`  
**Composant** : `PersonProfile.tsx`  
**API** : `GET /api/persons/{id}`, `GET /api/persons/{id}/children`, `GET /api/persons/{id}/weddings`  
**Description** : Consultation complète d'un membre (4 onglets : Identité, Famille, Chronologie, Bio).

**Droits d'édition** :
- ✅ Bouton "Modifier" visible si `isCurrentUser` (c'est moi)
- ✅ Bouton "Modifier" visible si Admin (TODO : implémenter role)
- ❌ Sinon lecture seule

**Navigation** :
- Clic sur parent → `/person/{fatherID}`
- Clic sur enfant → `/person/{childID}`
- Clic sur conjoint → `/person/{spouseID}`

---

### 3️⃣ **AJOUTER UN MEMBRE** (Gestion Famille)

**Route** : `/add-member`  
**Composant** : `AddMember.tsx`  
**API** : `POST /api/persons`  
**Description** : Ajouter **UNE AUTRE PERSONNE** dans la famille (parent, enfant, oncle...).

**Contexte d'utilisation** :
- ✅ Depuis Dashboard → "Ajouter un membre à ma famille"
- ✅ Depuis PersonsList → "Ajouter un membre"
- ✅ Depuis FamilyTree → "Ajouter une personne à l'arbre"

**Formulaire** :
- Prénom, Nom, Sexe, Date naissance
- **Relations** : Père, Mère (selects pré-remplis)
- Email (optionnel)
- Profession, Bio, Photo

**Bouton Dashboard** :
```tsx
<Button onClick={() => navigate('/add-member')}>
  Ajouter un membre à ma famille 👨‍👩‍👧‍👦
</Button>
```

---

### 4️⃣ **MODIFIER UN MEMBRE** (Admin/Droits)

**Route** : `/edit-member/:id`  
**Composant** : `EditMember.tsx`  
**API** : `PUT /api/persons/{id}`  
**Description** : Modifier n'importe quel membre **SI DROITS**.

**Vérifications backend** :
```csharp
// PersonsController.cs - PUT /api/persons/{id}
var userIdPerson = int.Parse(User.FindFirst("personId").Value);
var person = await _context.Persons.FindAsync(id);

// Vérifier si utilisateur peut modifier
if (person.CreatedBy != userIdPerson && !User.IsInRole("Admin")) {
    return Forbid(); // 403 Forbidden
}
```

**Accès** :
- ✅ Depuis PersonProfile → Bouton "Modifier" si canEdit
- ✅ Depuis PersonsList → Bouton "Modifier" (liste admin)

---

## 🔄 Workflow Utilisateur

### Premier Utilisateur (Créateur Famille)

```
1. Inscription → FamilySetup (créer famille)
   ↓
2. CompleteProfile (remplir MES infos)
   ↓
3. Dashboard
   ↓
4a. "Mon Profil" → Modifier MES infos
4b. "Ajouter un membre" → Ajouter père, mère, enfant...
4c. "Voir l'arbre" → Visualiser famille
```

### Membre Invité (Join avec code)

```
1. Inscription → FamilySetup (joindre avec code)
   ↓
2. CompleteProfile (remplir MES infos + lier parent)
   ↓
3. Dashboard
   ↓
4a. "Mon Profil" → Modifier MES infos
4b. "Voir Membres" → Consulter famille (lecture)
4c. "Voir l'arbre" → Visualiser
```

---

## 🛠️ Changements à Implémenter

### 1. Dashboard - Clarifier Boutons

**Avant** :
```tsx
<Button onClick={() => navigate('/add-member')}>
  Ajouter un membre
</Button>
```

**Après** :
```tsx
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
  {/* Moi-même */}
  <Card cursor="pointer" onClick={() => navigate('/my-profile')}>
    <CardBody>
      <Icon as={FaUserEdit} boxSize={8} color="blue.500" />
      <Heading size="md">Mon Profil</Heading>
      <Text>Modifier mes informations personnelles</Text>
    </CardBody>
  </Card>

  {/* Famille */}
  <Card cursor="pointer" onClick={() => navigate('/add-member')}>
    <CardBody>
      <Icon as={FaUserPlus} boxSize={8} color="green.500" />
      <Heading size="md">Ajouter un Membre Familial</Heading>
      <Text>Ajouter un parent, enfant, conjoint...</Text>
    </CardBody>
  </Card>
</SimpleGrid>
```

---

### 2. PersonProfile - Bouton "Modifier"

**Condition actuelle** :
```tsx
const canEdit = isCurrentUser; // Seulement si c'est moi
```

**Amélioration** :
```tsx
const isCurrentUser = user?.idPerson === parseInt(id || '0');
const isAdmin = user?.role === 'admin'; // TODO: Ajouter rôle dans JWT
const isCreator = person?.createdBy === user?.idPerson; // TODO: Backend retourne CreatedBy

const canEdit = isCurrentUser || isAdmin || isCreator;
```

**Bouton** :
```tsx
{canEdit && (
  <Button onClick={() => navigate(`/edit-member/${person.personID}`)}>
    Modifier les informations
  </Button>
)}
```

---

### 3. EditMember - Vérification Droits Backend

**Ajouter dans PersonsController.cs** :
```csharp
[HttpPut("{id}")]
[Authorize]
public async Task<IActionResult> PutPerson(int id, Person person)
{
    // Récupérer l'utilisateur connecté
    var userIdPerson = int.Parse(User.FindFirst("personId").Value);
    var existingPerson = await _context.Persons.FindAsync(id);
    
    if (existingPerson == null) return NotFound();

    // Vérifier droits : Admin OU Créateur OU Soi-même
    var isAdmin = User.IsInRole("Admin");
    var isCreator = existingPerson.CreatedBy == userIdPerson;
    var isSelf = existingPerson.PersonID == userIdPerson;

    if (!isAdmin && !isCreator && !isSelf)
    {
        return Forbid(); // 403 Forbidden
    }

    // Mise à jour autorisée
    // ...
}
```

---

### 4. CompleteProfile - Distinguer de AddMember

**CompleteProfile.tsx** :
- Utilisé **UNIQUEMENT après inscription**
- Redirige depuis `Register` ou `FamilySetup`
- Crée le Person avec `POST /api/persons` **UNE SEULE FOIS**

**AddMember.tsx** :
- Utilisé **depuis Dashboard/PersonsList**
- Ajoute **D'AUTRES PERSONNES** (pas soi-même)
- Formulaire avec selects Père/Mère

**Différenciation visuelle** :

**CompleteProfile** :
```tsx
<Heading>Complétez votre profil</Heading>
<Text>Pour commencer, dites-nous qui vous êtes 👤</Text>
```

**AddMember** :
```tsx
<Heading>Ajouter un membre familial</Heading>
<Text>Ajoutez un parent, enfant, ou membre de votre arbre 👨‍👩‍👧‍👦</Text>
```

---

## 📊 Tableau Récapitulatif

| Page | Route | Utilisé Pour | API | Qui peut accéder ? |
|------|-------|--------------|-----|-------------------|
| **CompleteProfile** | `/complete-profile` | Remplir MES infos (1ère fois) | `POST /persons` | Nouveau inscrit |
| **MyProfile** | `/my-profile` | Modifier MES infos | `PUT /persons/me` | Moi connecté |
| **PersonProfile** | `/person/:id` | **Voir** un membre | `GET /persons/{id}` | Tous (lecture) |
| **AddMember** | `/add-member` | Ajouter **AUTRE** personne | `POST /persons` | Tous (créer autre) |
| **EditMember** | `/edit-member/:id` | Modifier **AUTRE** personne | `PUT /persons/{id}` | Admin/Créateur |

---

## 🎯 Résumé Visuel

```
┌──────────────────────────────────────────┐
│          UTILISATEUR CONNECTÉ            │
└──────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼                       ▼
┌───────────────┐       ┌──────────────┐
│  MON PROFIL   │       │   FAMILLE    │
│               │       │              │
│ • Mes infos   │       │ • Voir arbre │
│ • Modifier    │       │ • Voir liste │
│   email, bio  │       │ • Ajouter    │
│               │       │   membres    │
│ Route:        │       │ • Modifier   │
│ /my-profile   │       │   (si admin) │
└───────────────┘       └──────────────┘
        │                       │
        ▼                       ▼
  PUT /persons/me      POST /persons (autre)
                       PUT /persons/{id} (autre)
```

---

## ✅ Action Immédiate

**Pour éviter confusion** :

1. **Dashboard** : Renommer bouton
   - ❌ "Ajouter un membre"
   - ✅ "Ajouter un membre familial" (précise que c'est **autre personne**)

2. **AddMember** : Ajouter alerte
   ```tsx
   <Alert status="info">
     <AlertIcon />
     Vous ajoutez une autre personne à votre arbre familial.
     Pour modifier vos propres informations, allez dans "Mon Profil".
   </Alert>
   ```

3. **MyProfile** : Titre clair
   - ✅ "Mes Informations Personnelles"
   - ✅ "Modifier mon profil"

---

**Voulez-vous que j'implémente ces changements maintenant ?** 🚀
