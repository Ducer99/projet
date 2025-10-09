# 🔐 Système de Permissions Granulaires - Kinship Haven

## 📊 Règle de modification d'un membre

Un utilisateur peut **modifier un membre** si et seulement si :

1. ✅ Il est **Administrateur** (`role = "Admin"`)
2. ✅ Il est le **créateur** du membre (`CreatedBy = userConnexionID`)
3. ✅ C'est **son propre profil** (`PersonID = userPersonID`)

❌ Sinon : **Lecture seule**

---

## 🎯 Cas d'usage

### Exemple 1 : Admin crée un membre

```
👤 Jacques (Admin, ConnexionID=4)
└── Crée → 👤 Marie (PersonID=17, CreatedBy=4)

Permissions :
- Jacques peut modifier Marie ✅ (Admin + Créateur)
- Marie peut modifier son profil ✅ (Son propre profil, quand elle se connecte)
- Sophie (Member) ne peut PAS modifier Marie ❌ (Ni admin, ni créateur, ni son profil)
```

### Exemple 2 : Membre crée son propre profil

```
👤 Sophie (Member, ConnexionID=5, PersonID=7)
└── Inscription → Création automatique de PersonID=7 avec CreatedBy=5

Permissions :
- Sophie peut modifier PersonID=7 ✅ (Son propre profil + Créateur)
- Jacques (Admin) peut modifier PersonID=7 ✅ (Admin)
- Autres membres ne peuvent PAS modifier PersonID=7 ❌
```

### Exemple 3 : Membre ajoute un parent décédé

```
👤 Pierre (Member, ConnexionID=3, PersonID=3)
└── Ajoute via MemberForm → 👤 Grand-père Paul (PersonID=20, CreatedBy=3)

Permissions :
- Pierre peut modifier Paul ✅ (Créateur)
- Admin peut modifier Paul ✅ (Admin)
- Paul ne peut PAS se connecter (compte placeholder pour personne décédée)
- Autres membres ne peuvent PAS modifier Paul ❌
```

---

## 🔧 Implémentation Backend

### 1. Modèle Person.cs

```csharp
[Table("Person")]
public class Person
{
    [Key]
    public int PersonID { get; set; }
    
    // ... autres champs
    
    public int? CreatedBy { get; set; } // ID de la Connexion qui a créé ce membre
    
    [ForeignKey("CreatedBy")]
    public virtual Connexion? Creator { get; set; }
}
```

### 2. Migration SQL

```sql
-- Ajouter la colonne CreatedBy
ALTER TABLE "Person" 
ADD COLUMN IF NOT EXISTS "CreatedBy" INTEGER;

-- Foreign key vers Connexion
ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_Connexion_CreatedBy" 
FOREIGN KEY ("CreatedBy") REFERENCES "Connexion"("ConnexionID")
ON DELETE SET NULL;

-- Index pour performances
CREATE INDEX IF NOT EXISTS "IX_Person_CreatedBy" ON "Person"("CreatedBy");
```

### 3. PersonsController - Création

```csharp
[HttpPost]
[Authorize]
public async Task<ActionResult<Person>> PostPerson(Person person)
{
    var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
    var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    
    // 🔒 Forcer le FamilyID et enregistrer le créateur
    person.FamilyID = userFamilyId;
    person.CreatedBy = userConnexionId; // 📝 Tracer qui a créé ce membre
    
    _context.Persons.Add(person);
    await _context.SaveChangesAsync();
    
    return CreatedAtAction("GetPerson", new { id = person.PersonID }, person);
}
```

### 4. PersonsController - Modification (avec permissions)

```csharp
[HttpPut("{id}")]
[Authorize]
public async Task<IActionResult> PutPerson(int id, Person person)
{
    // Récupérer les infos utilisateur
    var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    var userRole = User.FindFirst("role")?.Value ?? "Member";
    var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");
    
    var existingPerson = await _context.Persons.FindAsync(id);
    
    // 🔒 Vérifier les permissions : Admin OU Créateur OU Son propre profil
    bool isAdmin = userRole == "Admin";
    bool isCreator = existingPerson.CreatedBy == userConnexionId;
    bool isOwnProfile = existingPerson.PersonID == userPersonId;
    
    if (!isAdmin && !isCreator && !isOwnProfile)
    {
        return StatusCode(403, new { 
            message = "Vous ne pouvez modifier que votre propre profil ou les membres que vous avez créés" 
        });
    }
    
    // 🔒 Empêcher le changement de CreatedBy (garder le créateur original)
    person.CreatedBy = existingPerson.CreatedBy;
    
    _context.Entry(existingPerson).CurrentValues.SetValues(person);
    await _context.SaveChangesAsync();
    
    return NoContent();
}
```

### 5. PersonsController - Endpoint de vérification

```csharp
// GET: api/Persons/{id}/can-edit
[HttpGet("{id}/can-edit")]
[Authorize]
public async Task<ActionResult> CanEditPerson(int id)
{
    var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    var userRole = User.FindFirst("role")?.Value ?? "Member";
    var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");

    var person = await _context.Persons.FindAsync(id);
    
    bool isAdmin = userRole == "Admin";
    bool isCreator = person.CreatedBy == userConnexionId;
    bool isOwnProfile = person.PersonID == userPersonId;
    
    bool canEdit = isAdmin || isCreator || isOwnProfile;
    
    return Ok(new 
    { 
        canEdit,
        isAdmin,
        isCreator,
        isOwnProfile
    });
}
```

### 6. AuthController - JWT avec rôle

```csharp
private string GenerateJwtToken(Connexion user)
{
    var claims = new List<Claim>
    {
        new Claim("id", user.ConnexionID.ToString()),
        new Claim("username", user.UserName),
        new Claim("level", user.Level.ToString()),
        new Claim("role", user.Role), // ✅ Ajouter le rôle dans le JWT
    };
    
    if (user.IDPerson.HasValue)
        claims.Add(new Claim("personId", user.IDPerson.Value.ToString()));
    
    if (user.FamilyID.HasValue)
        claims.Add(new Claim("familyId", user.FamilyID.Value.ToString()));
    
    // ... génération du token
}
```

---

## 🎨 Implémentation Frontend

### 1. Interface User avec rôle

```typescript
// frontend/src/types/index.ts
export interface User {
  connexionID: number;
  userName: string;
  level: number;
  idPerson: number;
  familyID: number;
  personName: string;
  familyName: string;
  role: string; // "Admin" ou "Member"
}
```

### 2. PersonsList - Vérification dynamique des permissions

```typescript
// frontend/src/pages/PersonsList.tsx
interface PersonWithPermissions extends Person {
  canEdit?: boolean;
  isCreator?: boolean;
}

const fetchPersons = async () => {
  const response = await api.get('/persons');
  const personsData = response.data;
  
  // Vérifier les permissions pour chaque membre
  const personsWithPermissions = await Promise.all(
    personsData.map(async (person: Person) => {
      try {
        const permResponse = await api.get(`/persons/${person.personID}/can-edit`);
        return {
          ...person,
          canEdit: permResponse.data.canEdit,
          isCreator: permResponse.data.isCreator,
        };
      } catch {
        return { ...person, canEdit: false };
      }
    })
  );
  
  setPersons(personsWithPermissions);
};
```

### 3. Affichage conditionnel des boutons

```typescript
{person.canEdit ? (
  <Tooltip
    label={
      isAdmin
        ? '🔑 Admin'
        : person.isCreator
        ? '✨ Vous avez créé ce membre'
        : '👤 Votre profil'
    }
  >
    <Button
      colorScheme="purple"
      onClick={() => navigate(`/edit-member/${person.personID}`)}
    >
      Modifier
    </Button>
  </Tooltip>
) : (
  <Tooltip label="🔒 Vous ne pouvez pas modifier ce membre">
    <Badge colorScheme="gray">
      <FaLock /> Lecture seule
    </Badge>
  </Tooltip>
)}
```

### 4. Protection MemberForm (Admin uniquement)

```typescript
// frontend/src/pages/MemberForm.tsx
const { user } = useAuth();
const isAdmin = user?.role === 'Admin';

if (!isAdmin) {
  return (
    <Box>
      <Heading>🔒 Accès réservé aux administrateurs</Heading>
      <Text>
        Seuls les administrateurs peuvent créer de nouveaux membres via ce formulaire.
        Vous pouvez modifier votre propre profil via "Mon Profil".
      </Text>
    </Box>
  );
}
```

---

## 📋 Matrice des Permissions Complète

| Scénario | Admin | Créateur | Propriétaire | Autre Member |
|----------|-------|----------|--------------|--------------|
| **Voir son profil** | ✅ | ✅ | ✅ | ✅ |
| **Modifier son profil** | ✅ | ✅ | ✅ | ❌ |
| **Voir autre membre** | ✅ | ✅ | ✅ | ✅ |
| **Modifier membre qu'il a créé** | ✅ | ✅ | - | ❌ |
| **Modifier n'importe quel membre** | ✅ | ❌ | ❌ | ❌ |
| **Ajouter nouveau membre (MemberForm)** | ✅ | - | - | ❌ |
| **Supprimer un membre** | ✅ | ❌ | ❌ | ❌ |

---

## 🔍 Exemples Concrets

### Cas 1 : Famille Dupont

```
👤 Jacques Dupont (Admin, ConnexionID=4, PersonID=16)
├── Crée → 👤 Marie Dupont (PersonID=17, CreatedBy=4)
├── Crée → 👤 Pierre Dupont (PersonID=3, CreatedBy=4)
└── 👤 Sophie Martin (PersonID=7, CreatedBy=7, inscrite seule)

Permissions :
- Jacques peut modifier : 16, 17, 3 ✅ (Admin)
- Marie (ConnexionID=17) peut modifier : 17 ✅ (Son profil)
- Pierre (ConnexionID=3) peut modifier : 3 ✅ (Son profil)
- Sophie (ConnexionID=7) peut modifier : 7 ✅ (Son profil + Créateur)
- Sophie NE PEUT PAS modifier : 16, 17, 3 ❌
```

### Cas 2 : Membre ajoute ses parents décédés

```
👤 Sophie Martin (Member, ConnexionID=7, PersonID=7)
└── Ajoute (via admin ?) :
    ├── 👤 Paul Martin (PersonID=20, CreatedBy=7, décédé)
    └── 👤 Anne Martin (PersonID=21, CreatedBy=7, décédée)

Permissions :
- Sophie peut modifier : 7, 20, 21 ✅ (Son profil + Créateur)
- Jacques (Admin) peut modifier : 20, 21 ✅ (Admin)
- Pierre NE PEUT PAS modifier : 20, 21 ❌ (Ni admin, ni créateur, ni son profil)
```

---

## ✅ Avantages de ce système

1. **Granularité** : Permissions au niveau individuel, pas juste admin/member
2. **Traçabilité** : On sait toujours qui a créé quel membre
3. **Flexibilité** : Un membre peut enrichir l'arbre généalogique (parents décédés) sans être admin
4. **Sécurité** : Protection backend ET frontend
5. **UX claire** : Badges et tooltips expliquent pourquoi on peut/ne peut pas modifier

---

## 🚀 Prochaines améliorations possibles

1. **Historique des modifications** : Qui a modifié quoi et quand
2. **Délégation de permissions** : Admin peut donner des droits temporaires
3. **Demandes de modification** : Membres peuvent proposer des changements aux admins
4. **Notifications** : Alerter le créateur quand son membre est modifié par un admin
5. **Validation collaborative** : Plusieurs membres doivent approuver certains changements

---

**Date de création** : 8 octobre 2025  
**Dernière mise à jour** : 8 octobre 2025  
**Statut** : ✅ Implémenté et testé
