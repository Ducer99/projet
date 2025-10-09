# 💍 Guide du Système de Mariage Amélioré

## 🎯 Vue d'Ensemble

Ce système implémente l'analyse structurale de Lévi-Strauss pour gérer :
- ✅ **Unions multiples** (coutumière, civile, religieuse)
- ✅ **Double lignage** (famille paternelle + maternelle)
- ✅ **Relations d'alliance** (gendre, bru, beau-parent)

---

## 📊 Structure des Tables

### 1. Wedding (Table Principale)

```sql
Wedding (
    WeddingID,
    ManID,                    -- L'époux
    WomanID,                  -- L'épouse
    PatrilinealFamilyID,      -- 🆕 Famille de référence (celle du mari)
    Status,                   -- 🆕 'active', 'divorced', 'widowed'
    WeddingDate,              -- Date principale
    DivorceDate,
    IsActive,
    Location,
    Notes,
    CreatedBy,                -- 🆕 Qui a créé l'enregistrement
    CreatedAt,                -- 🆕 Date de création
    UpdatedAt                 -- 🆕 Date de mise à jour
)
```

### 2. MarriageUnion (Unions Multiples) 🆕

```sql
MarriageUnion (
    UnionID,
    WeddingID,                -- FK → Wedding
    UnionType,                -- 'coutumière' | 'civile' | 'religieuse' | 'traditionnelle' | 'autre'
    UnionDate,                -- Date de cette union spécifique
    Location,                 -- Lieu de l'union
    Notes,
    Validated,                -- Si l'union a été célébrée
    CreatedAt
)
```

### 3. Person (Double Lignage) 🆕

```sql
Person (
    PersonID,
    ...
    FamilyID,                 -- Famille actuelle (compatibilité)
    PaternalFamilyID,         -- 🆕 Famille du père (lignage paternel)
    MaternalFamilyID,         -- 🆕 Famille de la mère (lignage maternel)
    ...
)
```

### 4. FamilyRelation (Relations d'Alliance) 🆕

```sql
FamilyRelation (
    RelationID,
    PersonID,                 -- La personne
    FamilyID,                 -- La famille avec laquelle elle a une relation
    RelationType,             -- 'member' | 'gendre' | 'bru' | 'beau-père' | 'belle-mère' | ...
    StartDate,                -- Début de la relation (ex: date de mariage)
    EndDate,                  -- Fin de la relation (ex: divorce, décès)
    Notes,
    CreatedAt
)
```

---

## 🔧 Cas d'Usage

### Cas 1 : Créer un Mariage avec 3 Unions

**Scénario** : Paul Ka (Famille KA) épouse Léa Moukala (Famille MOUKALA)
- Union coutumière : 12 juin 2015 à Mbalmayo
- Union civile : 20 juillet 2016 à Yaoundé
- Union religieuse : 5 août 2017 à Douala

```sql
-- 1. Créer le mariage principal
INSERT INTO "Wedding" (
    "ManID", 
    "WomanID", 
    "PatrilinealFamilyID",
    "Status",
    "WeddingDate",
    "IsActive",
    "CreatedBy"
)
VALUES (
    5,              -- Paul Ka
    8,              -- Léa Moukala
    1,              -- Famille KA (famille du mari)
    'active',
    '2015-06-12',   -- Date de la première union
    TRUE,
    1               -- ID de la connexion qui crée
) RETURNING "WeddingID";

-- Supposons que WeddingID = 10

-- 2. Ajouter les 3 types d'unions
INSERT INTO "MarriageUnion" ("WeddingID", "UnionType", "UnionDate", "Location", "Validated")
VALUES 
    (10, 'coutumière', '2015-06-12', 'Village Mbalmayo', TRUE),
    (10, 'civile', '2016-07-20', 'Mairie de Yaoundé', TRUE),
    (10, 'religieuse', '2017-08-05', 'Cathédrale de Douala', TRUE);

-- 3. Créer les relations d'alliance
-- Paul devient "gendre" dans la Famille MOUKALA
INSERT INTO "FamilyRelation" ("PersonID", "FamilyID", "RelationType", "StartDate")
VALUES (5, 2, 'gendre', '2015-06-12');  -- 2 = Famille MOUKALA

-- Léa devient "bru" dans la Famille KA
INSERT INTO "FamilyRelation" ("PersonID", "FamilyID", "RelationType", "StartDate")
VALUES (8, 1, 'bru', '2015-06-12');  -- 1 = Famille KA

-- 4. Mettre à jour le double lignage de Léa
UPDATE "Person"
SET 
    "PaternalFamilyID" = 2,  -- Famille MOUKALA (son père)
    "MaternalFamilyID" = 2,  -- Famille MOUKALA (sa mère, même famille)
    "FamilyID" = 1           -- Famille KA (par alliance)
WHERE "PersonID" = 8;
```

### Cas 2 : Afficher un Mariage Complet

```sql
-- Voir toutes les informations d'un mariage
SELECT 
    m.*,
    mu."UnionType",
    mu."UnionDate",
    mu."Location",
    mu."Validated"
FROM "MarriageComplete" m
LEFT JOIN "MarriageUnion" mu ON m."WeddingID" = mu."WeddingID"
WHERE m."WeddingID" = 10
ORDER BY mu."UnionDate";

-- Résultat :
-- WeddingID: 10
-- ManName: Paul Ka
-- WomanName: Léa Moukala
-- PatrilinealFamilyName: Famille KA
-- UnionTypes: coutumière, civile, religieuse
-- FirstUnionDate: 2015-06-12
-- LastUnionDate: 2017-08-05
```

### Cas 3 : Afficher les Relations d'une Famille

```sql
-- Voir tous les gendres de la Famille MOUKALA
SELECT * FROM get_gendres(2);

-- Ou avec la table directement
SELECT 
    p."FirstName" || ' ' || p."LastName" AS "Nom",
    fr."RelationType",
    fr."StartDate"
FROM "FamilyRelation" fr
JOIN "Person" p ON fr."PersonID" = p."PersonID"
WHERE fr."FamilyID" = 2
  AND fr."RelationType" IN ('gendre', 'bru', 'beau-père', 'belle-mère');
```

### Cas 4 : Double Lignage

**Scénario** : Sophie a un père de la Famille DUPONT et une mère de la Famille MARTIN

```sql
UPDATE "Person"
SET 
    "PaternalFamilyID" = 1,  -- Famille DUPONT
    "MaternalFamilyID" = 3   -- Famille MARTIN
WHERE "PersonID" = 15;

-- Voir le lignage de Sophie
SELECT * FROM "PersonLineage"
WHERE "PersonID" = 15;

-- Résultat :
-- PersonID: 15
-- FirstName: Sophie
-- LastName: Dupont
-- PaternalFamilyName: Famille DUPONT
-- MaternalFamilyName: Famille MARTIN
-- LineageType: Double lignage
```

---

## 🎨 Affichage Frontend

### API : Mariage Complet

```typescript
// GET /api/marriages/{id}
interface MarriageComplete {
  weddingID: number;
  manID: number;
  manName: string;
  womanID: number;
  womanName: string;
  patrilinealFamilyID: number;
  patrilinealFamilyName: string;
  status: 'active' | 'divorced' | 'widowed';
  unions: MarriageUnion[];
}

interface MarriageUnion {
  unionID: number;
  unionType: 'coutumière' | 'civile' | 'religieuse' | 'traditionnelle' | 'autre';
  unionDate: string;
  location?: string;
  validated: boolean;
}
```

### Composant React : Affichage des Unions

```tsx
<Box>
  <Heading size="md">
    💍 Mariage de {marriage.manName} et {marriage.womanName}
  </Heading>
  
  <Text color="gray.600" fontSize="sm">
    Famille de référence : {marriage.patrilinealFamilyName}
  </Text>

  <VStack spacing={3} mt={4}>
    {marriage.unions.map((union) => (
      <Box 
        key={union.unionID}
        borderLeft="3px solid"
        borderLeftColor={getUnionColor(union.unionType)}
        pl={4}
        py={2}
      >
        <HStack>
          <Text fontWeight="bold">
            {getUnionEmoji(union.unionType)} {capitalize(union.unionType)}
          </Text>
          {union.validated && <Badge colorScheme="green">Validé</Badge>}
        </HStack>
        
        <Text fontSize="sm" color="gray.600">
          {formatDate(union.unionDate)}
        </Text>
        
        {union.location && (
          <Text fontSize="sm" color="gray.500">
            📍 {union.location}
          </Text>
        )}
      </Box>
    ))}
  </VStack>
</Box>

// Helpers
const getUnionColor = (type: string) => {
  switch(type) {
    case 'coutumière': return 'purple';
    case 'civile': return 'blue';
    case 'religieuse': return 'gold';
    default: return 'gray';
  }
};

const getUnionEmoji = (type: string) => {
  switch(type) {
    case 'coutumière': return '🌍';
    case 'civile': return '🏛️';
    case 'religieuse': return '⛪';
    default: return '💍';
  }
};
```

---

## 🔍 Requêtes Utiles

### 1. Mariages avec Unions Incomplètes

```sql
-- Trouver les mariages qui n'ont pas les 3 types d'unions
SELECT 
    w."WeddingID",
    p1."FirstName" || ' ' || p1."LastName" AS "Époux",
    p2."FirstName" || ' ' || p2."LastName" AS "Épouse",
    STRING_AGG(mu."UnionType", ', ') AS "Unions célébrées",
    COUNT(mu."UnionID") AS "Nombre d''unions"
FROM "Wedding" w
JOIN "Person" p1 ON w."ManID" = p1."PersonID"
JOIN "Person" p2 ON w."WomanID" = p2."PersonID"
LEFT JOIN "MarriageUnion" mu ON w."WeddingID" = mu."WeddingID"
WHERE w."IsActive" = TRUE
GROUP BY w."WeddingID", p1."FirstName", p1."LastName", p2."FirstName", p2."LastName"
HAVING COUNT(mu."UnionID") < 3;
```

### 2. Tous les Gendres et Brus d'une Famille

```sql
SELECT 
    fr."RelationType",
    p."FirstName" || ' ' || p."LastName" AS "Nom",
    fr."StartDate" AS "Depuis",
    w."WeddingID",
    CASE 
        WHEN w."IsActive" = TRUE THEN 'Marié(e)'
        WHEN w."DivorceDate" IS NOT NULL THEN 'Divorcé(e)'
        ELSE 'Statut inconnu'
    END AS "Statut"
FROM "FamilyRelation" fr
JOIN "Person" p ON fr."PersonID" = p."PersonID"
LEFT JOIN "Wedding" w ON 
    (w."ManID" = p."PersonID" AND fr."RelationType" = 'gendre') OR
    (w."WomanID" = p."PersonID" AND fr."RelationType" = 'bru')
WHERE fr."FamilyID" = 1  -- Famille KA
  AND fr."RelationType" IN ('gendre', 'bru')
ORDER BY fr."StartDate" DESC;
```

### 3. Personnes avec Double Lignage Différent

```sql
SELECT 
    p."PersonID",
    p."FirstName" || ' ' || p."LastName" AS "Nom",
    f1."FamilyName" AS "Famille Paternelle",
    f2."FamilyName" AS "Famille Maternelle"
FROM "Person" p
JOIN "Family" f1 ON p."PaternalFamilyID" = f1."FamilyID"
JOIN "Family" f2 ON p."MaternalFamilyID" = f2."FamilyID"
WHERE p."PaternalFamilyID" != p."MaternalFamilyID";
```

---

## 📋 Checklist de Migration

### Avant Migration
- [ ] Sauvegarder la base de données
- [ ] Vérifier les mariages existants
- [ ] Identifier les familles patrilinéaires

### Pendant Migration
- [ ] Exécuter `migration-marriage-improved.sql`
- [ ] Vérifier que toutes les contraintes sont créées
- [ ] Valider les données migrées

### Après Migration
- [ ] Ajouter les unions manquantes (coutumière, religieuse)
- [ ] Définir les doubles lignages
- [ ] Créer les relations d'alliance (gendre, bru)
- [ ] Mettre à jour les modèles backend (C#)
- [ ] Adapter les interfaces frontend (React)

---

## 🚀 Commandes Rapides

```bash
# Exécuter la migration
psql -U ducer -d FamilyTreeDB -f database/migration-marriage-improved.sql

# Vérifier les résultats
psql -U ducer -d FamilyTreeDB -c "SELECT * FROM \"MarriageComplete\" LIMIT 5;"

# Voir les unions d'un mariage
psql -U ducer -d FamilyTreeDB -c "SELECT * FROM get_marriage_unions(1);"

# Voir les gendres d'une famille
psql -U ducer -d FamilyTreeDB -c "SELECT * FROM get_gendres(1);"
```

---

## 🎯 Avantages du Nouveau Système

| Avant | Après |
|-------|-------|
| ❌ Une seule date de mariage | ✅ Plusieurs unions avec dates distinctes |
| ❌ Famille simple | ✅ Double lignage (paternel + maternel) |
| ❌ Pas de relations d'alliance | ✅ Gendre, bru, beau-parent explicites |
| ❌ Syncrétisme culturel | ✅ Respect de la complexité (coutume/civil/religieux) |
| ❌ Structure rigide | ✅ Flexibilité anthropologique |

---

## 📚 Références

- **Lévi-Strauss, C.** (1949). _Les Structures élémentaires de la parenté_
- Document : `ANALYSE_LEVI_STRAUSS_MARIAGE.md`
- Migration SQL : `migration-marriage-improved.sql`

---

**Système implémenté le 8 octobre 2025** 🎓
