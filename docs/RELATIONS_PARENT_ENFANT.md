# 🧬 Comment fonctionnent les relations Parent-Enfant

## 🎯 Principe Fondamental

**L'enfant pointe vers ses parents, pas l'inverse.**

Dans la table `Person`, chaque personne a :
- `PersonID` : identifiant unique
- `FatherID` : pointe vers le père (foreign key vers `Person.PersonID`)
- `MotherID` : pointe vers la mère (foreign key vers `Person.PersonID`)

### ⚠️ CONCEPT CLÉ : Double Rôle

**Une même personne peut avoir 2 rôles dans l'arbre généalogique :**

1. **Rôle d'ENFANT** : Dans sa propre ligne, elle a un `FatherID` et `MotherID`
2. **Rôle de PARENT** : D'autres personnes la référencent comme `FatherID` ou `MotherID`

**Exemple concret :**
```
Pierre (PersonID=3) :
  • EST ENFANT : sa ligne contient FatherID=1 (Jean), MotherID=2 (Marie)
  • EST PARENT : Lucas (PersonID=5) a FatherID=3 (Pierre)

➡️ Pierre garde toujours le même PersonID=3
   Mais il apparaît dans 2 contextes différents !
```

**C'est normal et c'est la force de ce système !** 
- Un `PersonID` ne change JAMAIS
- Mais une personne peut être enfant ET parent selon le contexte
- L'arbre grandit naturellement quand on ajoute des enfants

### Exemple concret :

```
┌─────────────────────────────────────────────────────┐
│                    Famille Dupont                    │
└─────────────────────────────────────────────────────┘

Génération 1 (Les grands-parents) :
┌─────────────────┐       ┌─────────────────┐
│ PersonID: 1     │       │ PersonID: 2     │
│ Jean Dupont     │  💑   │ Marie Martin    │
│ FatherID: NULL  │       │ FatherID: NULL  │
│ MotherID: NULL  │       │ MotherID: NULL  │
└─────────────────┘       └─────────────────┘
         │                         │
         └───────────┬─────────────┘
                     │
                     ↓
Génération 2 (Les parents) :
         ┌─────────────────┐       ┌─────────────────┐
         │ PersonID: 3     │       │ PersonID: 4     │
         │ Pierre Dupont   │  💑   │ Sophie Bernard  │
         │ FatherID: 1 ────┼──→ Jean
         │ MotherID: 2 ────┼──→ Marie
         └─────────────────┘       └─────────────────┘
                  │                         │
                  └───────────┬─────────────┘
                              │
                              ↓
Génération 3 (Les enfants) :
              ┌─────────────────┐  ┌─────────────────┐
              │ PersonID: 5     │  │ PersonID: 6     │
              │ Lucas Dupont    │  │ Emma Dupont     │
              │ FatherID: 3 ────┼──→ Pierre
              │ MotherID: 4 ────┼──→ Sophie
              └─────────────────┘  └─────────────────┘
```

## 2. 🔍 Comment reconnaître les relations

### A. Pour savoir qui sont les parents de X :

**C'est FACILE** : On regarde directement dans la ligne de X

```sql
-- Qui sont les parents de Lucas (PersonID = 5) ?
SELECT 
    p."FirstName",
    f."FirstName" as Pere,
    m."FirstName" as Mere
FROM "Person" p
LEFT JOIN "Person" f ON p."FatherID" = f."PersonID"
LEFT JOIN "Person" m ON p."MotherID" = m."PersonID"
WHERE p."PersonID" = 5;
```

**Résultat** :
```
 FirstName | Pere   | Mere
-----------+--------+--------
 Lucas     | Pierre | Sophie
```

### B. Pour savoir qui sont les enfants de Y :

**C'est une RECHERCHE INVERSE** : On cherche toutes les personnes qui ont Y comme père OU mère

```sql
-- Qui sont les enfants de Pierre (PersonID = 3) ?
SELECT 
    "PersonID",
    "FirstName",
    "LastName"
FROM "Person"
WHERE "FatherID" = 3 OR "MotherID" = 3;
```

**Résultat** :
```
 PersonID | FirstName | LastName
----------+-----------+----------
        5 | Lucas     | Dupont
        6 | Emma      | Dupont
```

## 3. 💻 Dans le code Backend (C#)

### Trouver les parents (FACILE) :

```csharp
// Entity Framework charge automatiquement grâce à Include()
var person = await _context.Persons
    .Include(p => p.Father)  // Charge le père via FatherID
    .Include(p => p.Mother)  // Charge la mère via MotherID
    .FirstOrDefaultAsync(p => p.PersonID == 5);

// Maintenant on peut accéder directement :
Console.WriteLine($"Père: {person.Father.FirstName}");
Console.WriteLine($"Mère: {person.Mother.FirstName}");
```

### Trouver les enfants (RECHERCHE) :

```csharp
// On cherche toutes les personnes qui ont ce PersonID comme parent
var children = await _context.Persons
    .Where(p => p.FatherID == 3 || p.MotherID == 3)
    .ToListAsync();

foreach (var child in children)
{
    Console.WriteLine($"Enfant: {child.FirstName}");
}
```

## 4. 🌳 Construction de l'arbre généalogique

### Algorithme récursif dans FamilyTreeController :

```csharp
// 1. On part des "racines" (personnes sans parents)
var roots = await _context.Persons
    .Where(p => p.FatherID == null && p.MotherID == null)
    .ToListAsync();
// Résultat: Jean (1) et Marie (2)

// 2. Pour chaque personne, on trouve ses enfants
private async Task<List<Person>> GetChildren(int personId)
{
    return await _context.Persons
        .Where(p => p.FatherID == personId || p.MotherID == personId)
        .ToListAsync();
}

// 3. Construction récursive de l'arbre
TreeNode BuildNode(Person person)
{
    var children = GetChildren(person.PersonID);
    var childNodes = children.Select(c => BuildNode(c)).ToList();
    
    return new TreeNode 
    { 
        Person = person,
        Children = childNodes
    };
}
```

## 5. 📝 Exemple complet étape par étape

### Scénario : "Lucas veut savoir qui sont ses grands-parents"

#### Étape 1 : On récupère Lucas
```sql
SELECT * FROM "Person" WHERE "PersonID" = 5;
-- Résultat: Lucas, FatherID=3, MotherID=4
```

#### Étape 2 : On récupère ses parents (Pierre et Sophie)
```sql
SELECT * FROM "Person" WHERE "PersonID" IN (3, 4);
-- Résultat: Pierre (FatherID=1, MotherID=2), Sophie
```

#### Étape 3 : On récupère les parents de Pierre (grands-parents)
```sql
SELECT * FROM "Person" WHERE "PersonID" IN (1, 2);
-- Résultat: Jean, Marie
```

### Dans le code Backend :

```csharp
var lucas = await _context.Persons
    .Include(p => p.Father)                    // Pierre
        .ThenInclude(f => f.Father)            // Jean (grand-père paternel)
    .Include(p => p.Father)
        .ThenInclude(f => f.Mother)            // Marie (grand-mère paternelle)
    .Include(p => p.Mother)                    // Sophie
        .ThenInclude(m => m.Father)            // Grand-père maternel
    .Include(p => p.Mother)
        .ThenInclude(m => m.Mother)            // Grand-mère maternelle
    .FirstOrDefaultAsync(p => p.PersonID == 5);

// Accès direct :
var grandPere = lucas.Father.Father;  // Jean
var grandMere = lucas.Father.Mother;  // Marie
```

## 6. 🔄 Comment ajouter une nouvelle génération

### Exemple : Lucas se marie et a un enfant (Léo)

```csharp
// 1. Créer Léo
var leo = new Person 
{
    FirstName = "Léo",
    LastName = "Dupont",
    Sex = "M",
    FatherID = 5,      // Lucas est le père
    MotherID = 7,      // ID de la future maman
    FamilyID = 1,
    CityID = 1,
    Alive = true
};

await _context.Persons.AddAsync(leo);
await _context.SaveChangesAsync();
```

**L'arbre est mis à jour automatiquement !**

```sql
-- Maintenant Lucas a des enfants :
SELECT * FROM "Person" WHERE "FatherID" = 5;
-- Résultat: Léo

-- Et Léo a des parents :
SELECT * FROM "Person" WHERE "PersonID" = (ID de Léo);
-- Résultat: FatherID=5 (Lucas), MotherID=7
```

## 7. 🎯 Avantages de cette architecture

### ✅ Avantages :

1. **Simple** : Chaque enfant sait qui sont ses parents
2. **Efficace** : Relations directes via Foreign Keys
3. **Flexible** : Support de la polygamie (un parent peut avoir plusieurs mariages)
4. **Évolutif** : L'arbre grandit automatiquement

### ⚠️ Points importants :

1. **FatherID et MotherID peuvent être NULL** (pour les ancêtres racines)
2. **Les relations sont OPTIONNELLES** (orphelins possibles)
3. **Chaque enfant a UN SEUL père et UNE SEULE mère biologiques**
4. **Un parent peut avoir PLUSIEURS enfants** (recherche inverse)
5. **Un parent peut avoir PLUSIEURS conjoints** (polygamie via table Wedding)

## 8. 🔍 Requêtes SQL utiles

### Trouver tous les descendants de Jean (récursif)

```sql
WITH RECURSIVE descendants AS (
    -- Ancre : Jean lui-même
    SELECT "PersonID", "FirstName", "FatherID", "MotherID", 0 as generation
    FROM "Person"
    WHERE "PersonID" = 1
    
    UNION ALL
    
    -- Récursion : enfants des descendants
    SELECT p."PersonID", p."FirstName", p."FatherID", p."MotherID", d.generation + 1
    FROM "Person" p
    INNER JOIN descendants d ON (p."FatherID" = d."PersonID" OR p."MotherID" = d."PersonID")
)
SELECT * FROM descendants ORDER BY generation;
```

**Résultat** :
```
 PersonID | FirstName | generation
----------+-----------+------------
        1 | Jean      | 0
        3 | Pierre    | 1
        5 | Lucas     | 2
        6 | Emma      | 2
```

### Trouver tous les ancêtres de Lucas (récursif)

```sql
WITH RECURSIVE ancestors AS (
    -- Ancre : Lucas lui-même
    SELECT "PersonID", "FirstName", "FatherID", "MotherID", 0 as generation
    FROM "Person"
    WHERE "PersonID" = 5
    
    UNION ALL
    
    -- Récursion : parents des ancêtres
    SELECT p."PersonID", p."FirstName", p."FatherID", p."MotherID", a.generation + 1
    FROM "Person" p
    INNER JOIN ancestors a ON (p."PersonID" = a."FatherID" OR p."PersonID" = a."MotherID")
)
SELECT * FROM ancestors ORDER BY generation DESC;
```

**Résultat** :
```
 PersonID | FirstName | generation
----------+-----------+------------
        1 | Jean      | 2
        2 | Marie     | 2
        3 | Pierre    | 1
        4 | Sophie    | 1
        5 | Lucas     | 0
```

## 9. 💡 En résumé

| Question | Réponse | Méthode |
|----------|---------|---------|
| "Qui sont les parents de X ?" | **FACILE** : On regarde `X.FatherID` et `X.MotherID` | SELECT direct |
| "Qui sont les enfants de Y ?" | **RECHERCHE** : On cherche qui a `FatherID=Y` ou `MotherID=Y` | WHERE clause |
| "Qui sont les frères/sœurs de X ?" | Même père OU même mère | WHERE FatherID = X.FatherID OR MotherID = X.MotherID |
| "Combien de générations ?" | **RÉCURSIF** : Compter depuis la racine | WITH RECURSIVE |
| "L'arbre grandit comment ?" | **AUTOMATIQUE** : Quand on crée un enfant avec FatherID/MotherID | INSERT INTO |
| **"Une personne peut être enfant ET parent ?"** | **✅ OUI !** Un PersonID, plusieurs rôles | Même ID, contextes différents |

---

## 10. 🔄 Concept crucial : Double Rôle

### ⚠️ TRÈS IMPORTANT !

**Une personne peut avoir 2 rôles simultanément dans l'arbre généalogique :**

1. **Rôle d'ENFANT** : Dans sa propre ligne avec `FatherID` et `MotherID` remplis
2. **Rôle de PARENT** : D'autres personnes la référencent via leur `FatherID` ou `MotherID`

### Exemple concret : Pierre (PersonID=3)

#### Pierre en tant qu'ENFANT :
```sql
SELECT PersonID, FirstName, FatherID, MotherID 
FROM "Person" 
WHERE PersonID = 3;
```
**Résultat** :
```
 PersonID | FirstName | FatherID | MotherID
----------+-----------+----------+----------
        3 | Pierre    | 1        | 2
```
➡️ Pierre **EST** enfant de Jean (1) et Marie (2)

#### Pierre en tant que PARENT :
```sql
SELECT PersonID, FirstName, FatherID 
FROM "Person" 
WHERE FatherID = 3;
```
**Résultat** :
```
 PersonID | FirstName | FatherID
----------+-----------+----------
        5 | Lucas     | 3
        6 | Emma      | 3
```
➡️ Lucas et Emma **ONT** Pierre comme père

### Visualisation du double rôle :

```
┌─────────────────────────────────────┐
│ Pierre (PersonID=3)                 │
│                                     │
│ Rôle 1: ENFANT                      │
│   ↓ FatherID=1 (Jean)               │
│   ↓ MotherID=2 (Marie)              │
│                                     │
│ Rôle 2: PARENT                      │
│   ↑ Lucas.FatherID=3                │
│   ↑ Emma.FatherID=3                 │
└─────────────────────────────────────┘

➡️ Même PersonID (3), deux contextes !
```

### Démonstration SQL complète :

```sql
-- Compter les rôles de chaque personne
SELECT 
    p.PersonID,
    p.FirstName,
    CASE 
        WHEN p.FatherID IS NOT NULL OR p.MotherID IS NOT NULL 
        THEN '✓ EST enfant'
        ELSE '✗ Racine'
    END as Role_Enfant,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM "Person" c 
            WHERE c.FatherID = p.PersonID OR c.MotherID = p.PersonID
        )
        THEN '✓ EST parent'
        ELSE '✗ Pas encore parent'
    END as Role_Parent,
    CASE 
        WHEN (p.FatherID IS NOT NULL OR p.MotherID IS NOT NULL)
         AND EXISTS (
             SELECT 1 FROM "Person" c 
             WHERE c.FatherID = p.PersonID OR c.MotherID = p.PersonID
         )
        THEN '🔄 DOUBLE RÔLE'
        ELSE 'Rôle unique'
    END as Statut
FROM "Person" p
ORDER BY p.PersonID;
```

**Résultat** :
```
 PersonID | FirstName | Role_Enfant  | Role_Parent    | Statut
----------+-----------+--------------+----------------+---------------
        1 | Jean      | ✗ Racine     | ✓ EST parent   | Rôle unique
        2 | Marie     | ✗ Racine     | ✓ EST parent   | Rôle unique
        3 | Pierre    | ✓ EST enfant | ✓ EST parent   | 🔄 DOUBLE RÔLE ← !
        4 | Sophie    | ✗ Racine     | ✓ EST parent   | Rôle unique
        5 | Lucas     | ✓ EST enfant | ✗ Pas encore.. | Rôle unique
        6 | Emma      | ✓ EST enfant | ✗ Pas encore.. | Rôle unique
```

### Que se passe-t-il si Lucas a un enfant ?

```sql
-- Ajoutons Tom comme fils de Lucas
INSERT INTO "Person" (FirstName, LastName, FatherID, MotherID, ...)
VALUES ('Tom', 'Dupont', 5, 7, ...);

-- Maintenant Lucas a aussi un double rôle !
SELECT PersonID, FirstName, FatherID FROM "Person" WHERE PersonID = 5;
-- PersonID=5, FatherID=3 → Lucas EST enfant de Pierre

SELECT PersonID, FirstName, FatherID FROM "Person" WHERE FatherID = 5;
-- PersonID=8, FatherID=5 → Tom a Lucas comme père
```

### 💡 Points clés à retenir :

1. **Un PersonID ne change JAMAIS** : Pierre reste toujours ID=3
2. **Une personne peut jouer plusieurs rôles** : enfant ET parent en même temps
3. **Le contexte détermine le rôle** :
   - Dans SA ligne → elle est ENFANT (via ses FatherID/MotherID)
   - Dans les lignes des AUTRES → elle est PARENT (les autres la référencent)
4. **C'est normal et souhaitable** : c'est ainsi que l'arbre généalogique se construit !
5. **L'arbre grandit naturellement** : chaque ajout de personne étend l'arbre automatiquement

---

**🎓 Principe clé : Les enfants pointent vers leurs parents, pas l'inverse !**

C'est comme dans la vie réelle : 
- Un enfant **sait** qui sont ses parents (lecture directe)
- Un parent **découvre** qu'il a des enfants (recherche inverse)
- **Une personne peut être les deux à la fois** (double rôle avec le même ID)
