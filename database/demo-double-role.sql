-- ================================================
-- DÉMONSTRATION : Une personne = 2 rôles possibles
-- ================================================

-- 1. Affichons Pierre dans son rôle d'ENFANT
SELECT 
    "PersonID",
    "FirstName",
    "FatherID",
    "MotherID",
    'Pierre en tant qu''ENFANT : il pointe vers Jean (1) et Marie (2)' as Explication
FROM "Person"
WHERE "PersonID" = 3;

-- Résultat :
-- PersonID | FirstName | FatherID | MotherID | Explication
-- 3        | Pierre    | 1        | 2        | Pierre en tant qu'ENFANT : il pointe vers Jean (1) et Marie (2)


-- 2. Affichons Pierre dans son rôle de PARENT
SELECT 
    p."PersonID",
    p."FirstName",
    p."FatherID" as "PierreEstPourEux",
    'Ces personnes ont Pierre (3) comme père' as Explication
FROM "Person" p
WHERE p."FatherID" = 3;

-- Résultat :
-- PersonID | FirstName | PierreEstPourEux | Explication
-- 5        | Lucas     | 3                | Ces personnes ont Pierre (3) comme père
-- 6        | Emma      | 3                | Ces personnes ont Pierre (3) comme père


-- 3. Vue complète des deux rôles de Pierre
SELECT 
    '--- PIERRE EN TANT QU''ENFANT ---' as Section,
    '' as PersonID,
    '' as Nom,
    '' as Relation,
    '' as Details
UNION ALL
SELECT 
    '',
    "PersonID"::text,
    "FirstName",
    'EST enfant de',
    'FatherID=' || COALESCE("FatherID"::text, 'NULL') || ', MotherID=' || COALESCE("MotherID"::text, 'NULL')
FROM "Person"
WHERE "PersonID" = 3

UNION ALL
SELECT 
    '--- PIERRE EN TANT QUE PARENT ---',
    '',
    '',
    '',
    ''
UNION ALL
SELECT 
    '',
    p."PersonID"::text,
    p."FirstName",
    'A pour père',
    'FatherID=' || p."FatherID"::text
FROM "Person" p
WHERE p."FatherID" = 3;


-- 4. Exemple concret : ajoutons un enfant à Lucas
-- Lucas (ID=5) va passer de "seulement ENFANT" à "ENFANT ET PARENT"

-- Créons d'abord une compagne pour Lucas
INSERT INTO "Person" ("FirstName", "LastName", "Birthday", "Email", "Sex", "Activity", "Alive", "CityID", "FamilyID")
VALUES ('Sophie', 'Martin', '1995-03-20', 'sophie.martin@example.com', 'F', 'Designer', TRUE, 1, 1)
ON CONFLICT DO NOTHING;

-- Récupérons l'ID de Sophie (supposons ID=7)
-- Créons maintenant un enfant pour Lucas et Sophie
INSERT INTO "Person" ("FirstName", "LastName", "Birthday", "Email", "Sex", "Activity", "Alive", "FatherID", "MotherID", "CityID", "FamilyID")
VALUES ('Tom', 'Dupont', '2020-06-15', 'tom.dupont@example.com', 'M', 'Étudiant', TRUE, 5, 7, 1, 1)
ON CONFLICT DO NOTHING;


-- 5. Maintenant Lucas a aussi 2 rôles !
SELECT 
    '=== LUCAS EN TANT QU''ENFANT ===' as Info,
    "PersonID",
    "FirstName",
    "FatherID",
    "MotherID"
FROM "Person"
WHERE "PersonID" = 5

UNION ALL

SELECT 
    '=== LUCAS EN TANT QUE PARENT ===',
    p."PersonID",
    p."FirstName",
    p."FatherID",
    p."MotherID"
FROM "Person" p
WHERE p."FatherID" = 5 OR p."MotherID" = 5;


-- 6. Arbre sur 4 générations maintenant !
WITH RECURSIVE generations AS (
    -- Génération 1 : Jean
    SELECT 
        "PersonID",
        "FirstName" || ' ' || "LastName" as NomComplet,
        1 as Generation,
        "FirstName" as Chemin
    FROM "Person"
    WHERE "PersonID" = 1
    
    UNION ALL
    
    -- Générations suivantes
    SELECT 
        p."PersonID",
        p."FirstName" || ' ' || p."LastName",
        g.Generation + 1,
        g.Chemin || ' → ' || p."FirstName"
    FROM "Person" p
    INNER JOIN generations g ON (p."FatherID" = g."PersonID" OR p."MotherID" = g."PersonID")
)
SELECT 
    Generation,
    "PersonID" as ID,
    NomComplet,
    Chemin as "Lignée_depuis_Jean"
FROM generations
ORDER BY Generation, "PersonID";

-- Résultat attendu :
-- Generation | ID | NomComplet      | Lignée_depuis_Jean
-- 1          | 1  | Jean Dupont     | Jean
-- 2          | 3  | Pierre Dupont   | Jean → Pierre
-- 3          | 5  | Lucas Dupont    | Jean → Pierre → Lucas
-- 4          | 8  | Tom Dupont      | Jean → Pierre → Lucas → Tom


-- 7. Démonstration finale : comptons les rôles
SELECT 
    p."PersonID",
    p."FirstName" || ' ' || p."LastName" as Nom,
    CASE 
        WHEN p."FatherID" IS NOT NULL OR p."MotherID" IS NOT NULL THEN '✓ EST enfant'
        ELSE '✗ Racine'
    END as Role_Enfant,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "Person" c WHERE c."FatherID" = p."PersonID" OR c."MotherID" = p."PersonID")
        THEN '✓ EST parent'
        ELSE '✗ Pas encore parent'
    END as Role_Parent,
    CASE 
        WHEN (p."FatherID" IS NOT NULL OR p."MotherID" IS NOT NULL)
         AND EXISTS (SELECT 1 FROM "Person" c WHERE c."FatherID" = p."PersonID" OR c."MotherID" = p."PersonID")
        THEN '🔄 DOUBLE RÔLE'
        ELSE 'Rôle unique'
    END as Statut
FROM "Person" p
ORDER BY p."PersonID";

-- Résultat :
-- PersonID | Nom             | Role_Enfant | Role_Parent      | Statut
-- 1        | Jean Dupont     | ✗ Racine    | ✓ EST parent     | Rôle unique
-- 2        | Marie Martin    | ✗ Racine    | ✓ EST parent     | Rôle unique  
-- 3        | Pierre Dupont   | ✓ EST enfant| ✓ EST parent     | 🔄 DOUBLE RÔLE ← ICI !
-- 4        | Sophie Bernard  | ✗ Racine    | ✓ EST parent     | Rôle unique
-- 5        | Lucas Dupont    | ✓ EST enfant| ✓ EST parent     | 🔄 DOUBLE RÔLE ← ICI !
-- 6        | Emma Dupont     | ✓ EST enfant| ✗ Pas encore...  | Rôle unique
-- 7        | Sophie Martin   | ✗ Racine    | ✓ EST parent     | Rôle unique
-- 8        | Tom Dupont      | ✓ EST enfant| ✗ Pas encore...  | Rôle unique


-- CONCLUSION :
-- ============
-- Un PersonID reste CONSTANT, mais la personne peut jouer plusieurs rôles :
-- 
-- 1. Dans SA PROPRE LIGNE → elle est ENFANT (via FatherID/MotherID)
-- 2. Dans les LIGNES DES AUTRES → elle est PARENT (les autres pointent vers elle)
-- 
-- C'est la beauté de cette architecture : simple, flexible, et naturelle !
