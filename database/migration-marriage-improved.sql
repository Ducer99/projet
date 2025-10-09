
-- Date : 8 octobre 2025

-- ================================================
-- PARTIE 1 : AMÉLIORATION DE LA TABLE MARRIAGE
-- ================================================

-- 1. Renommer Wedding en Marriage (plus précis)
-- Note: Si la table Wedding existe déjà, on l'adapte

-- Ajouter la famille patrilinéaire de référence
ALTER TABLE "Wedding"
ADD COLUMN "PatrilinealFamilyID" INTEGER,
ADD COLUMN "Status" VARCHAR(20) DEFAULT 'active',
ADD COLUMN "CreatedBy" INTEGER,
ADD COLUMN "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "UpdatedAt" TIMESTAMP;

-- Contraintes
ALTER TABLE "Wedding"
ADD CONSTRAINT "FK_Wedding_PatrilinealFamily"
FOREIGN KEY ("PatrilinealFamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

ALTER TABLE "Wedding"
ADD CONSTRAINT "FK_Wedding_CreatedBy"
FOREIGN KEY ("CreatedBy") REFERENCES "Connexion"("ConnexionID") ON DELETE SET NULL;

-- Index
CREATE INDEX "IX_Wedding_PatrilinealFamily" ON "Wedding"("PatrilinealFamilyID");
CREATE INDEX "IX_Wedding_Status" ON "Wedding"("Status");

-- Migrer les données existantes (PatrilinealFamilyID = FamilyID du mari)
UPDATE "Wedding" w
SET "PatrilinealFamilyID" = p."FamilyID"
FROM "Person" p
WHERE w."ManID" = p."PersonID";

-- ================================================
-- PARTIE 2 : TABLE MARRIAGE_UNIONS (Unions Multiples)
-- ================================================

CREATE TABLE IF NOT EXISTS "MarriageUnion" (
    "UnionID" SERIAL PRIMARY KEY,
    "WeddingID" INTEGER NOT NULL,
    "UnionType" VARCHAR(20) NOT NULL,
    "UnionDate" DATE NOT NULL,
    "Location" TEXT,
    "Notes" TEXT,
    "Validated" BOOLEAN DEFAULT FALSE,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "FK_MarriageUnion_Wedding"
    FOREIGN KEY ("WeddingID") REFERENCES "Wedding"("WeddingID") ON DELETE CASCADE,
    
    CONSTRAINT "CHK_UnionType"
    CHECK ("UnionType" IN ('coutumière', 'civile', 'religieuse', 'traditionnelle', 'autre'))
);

-- Index
CREATE INDEX "IX_MarriageUnion_Wedding" ON "MarriageUnion"("WeddingID");
CREATE INDEX "IX_MarriageUnion_Type" ON "MarriageUnion"("UnionType");
CREATE INDEX "IX_MarriageUnion_Date" ON "MarriageUnion"("UnionDate");

-- Commentaires
COMMENT ON TABLE "MarriageUnion" IS 'Types d''unions d''un mariage (coutumière, civile, religieuse)';
COMMENT ON COLUMN "MarriageUnion"."UnionType" IS 'Type : coutumière, civile, religieuse, traditionnelle, autre';
COMMENT ON COLUMN "MarriageUnion"."Validated" IS 'Si l''union a été validée/célébrée';

-- ================================================
-- PARTIE 3 : DOUBLE LIGNAGE DANS PERSON
-- ================================================

-- Ajouter les colonnes de double famille
ALTER TABLE "Person"
ADD COLUMN "PaternalFamilyID" INTEGER,
ADD COLUMN "MaternalFamilyID" INTEGER;

-- Contraintes
ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_PaternalFamily"
FOREIGN KEY ("PaternalFamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_MaternalFamily"
FOREIGN KEY ("MaternalFamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

-- Index
CREATE INDEX "IX_Person_PaternalFamily" ON "Person"("PaternalFamilyID");
CREATE INDEX "IX_Person_MaternalFamily" ON "Person"("MaternalFamilyID");

-- Migrer les données existantes
-- Par défaut, PaternalFamilyID = FamilyID actuel
UPDATE "Person"
SET "PaternalFamilyID" = "FamilyID"
WHERE "FamilyID" IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN "Person"."PaternalFamilyID" IS 'Famille du père (lignage paternel)';
COMMENT ON COLUMN "Person"."MaternalFamilyID" IS 'Famille de la mère (lignage maternel)';

-- ================================================
-- PARTIE 4 : TABLE FAMILY_RELATION (Relations d'Alliance)
-- ================================================

CREATE TABLE IF NOT EXISTS "FamilyRelation" (
    "RelationID" SERIAL PRIMARY KEY,
    "PersonID" INTEGER NOT NULL,
    "FamilyID" INTEGER NOT NULL,
    "RelationType" VARCHAR(30) NOT NULL,
    "StartDate" DATE,
    "EndDate" DATE,
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "FK_FamilyRelation_Person"
    FOREIGN KEY ("PersonID") REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    
    CONSTRAINT "FK_FamilyRelation_Family"
    FOREIGN KEY ("FamilyID") REFERENCES "Family"("FamilyID") ON DELETE CASCADE,
    
    CONSTRAINT "CHK_RelationType"
    CHECK ("RelationType" IN ('member', 'gendre', 'bru', 'beau-père', 'belle-mère', 
                               'beau-frère', 'belle-soeur', 'cousin', 'autre'))
);

-- Index
CREATE INDEX "IX_FamilyRelation_Person" ON "FamilyRelation"("PersonID");
CREATE INDEX "IX_FamilyRelation_Family" ON "FamilyRelation"("FamilyID");
CREATE INDEX "IX_FamilyRelation_Type" ON "FamilyRelation"("RelationType");

-- Commentaires
COMMENT ON TABLE "FamilyRelation" IS 'Relations d''alliance entre personnes et familles';
COMMENT ON COLUMN "FamilyRelation"."RelationType" IS 'Type : member, gendre, bru, beau-père, belle-mère, etc.';

-- ================================================
-- PARTIE 5 : MIGRATION DES MARIAGES EXISTANTS
-- ================================================

-- Créer les unions civiles pour les mariages existants
INSERT INTO "MarriageUnion" ("WeddingID", "UnionType", "UnionDate", "Location", "Validated")
SELECT 
    "WeddingID",
    'civile',
    "WeddingDate",
    "Location",
    TRUE
FROM "Wedding"
WHERE "WeddingDate" IS NOT NULL;

-- Créer les relations "gendre" pour les hommes mariés
INSERT INTO "FamilyRelation" ("PersonID", "FamilyID", "RelationType", "StartDate")
SELECT 
    w."ManID",
    p."FamilyID",
    'gendre',
    w."WeddingDate"
FROM "Wedding" w
JOIN "Person" p ON w."WomanID" = p."PersonID"
WHERE w."IsActive" = TRUE
  AND p."FamilyID" IS NOT NULL
  AND w."ManID" IS NOT NULL;

-- Créer les relations "bru" pour les femmes mariées
INSERT INTO "FamilyRelation" ("PersonID", "FamilyID", "RelationType", "StartDate")
SELECT 
    w."WomanID",
    p."FamilyID",
    'bru',
    w."WeddingDate"
FROM "Wedding" w
JOIN "Person" p ON w."ManID" = p."PersonID"
WHERE w."IsActive" = TRUE
  AND p."FamilyID" IS NOT NULL
  AND w."WomanID" IS NOT NULL;

-- ================================================
-- PARTIE 6 : VUES UTILES
-- ================================================

-- Vue : Mariages avec toutes leurs unions
CREATE OR REPLACE VIEW "MarriageComplete" AS
SELECT 
    w."WeddingID",
    w."ManID",
    p1."FirstName" || ' ' || p1."LastName" AS "ManName",
    w."WomanID",
    p2."FirstName" || ' ' || p2."LastName" AS "WomanName",
    w."PatrilinealFamilyID",
    f."FamilyName" AS "PatrilinealFamilyName",
    w."Status",
    w."WeddingDate",
    w."DivorceDate",
    w."IsActive",
    COUNT(mu."UnionID") AS "UnionCount",
    STRING_AGG(mu."UnionType", ', ' ORDER BY mu."UnionDate") AS "UnionTypes",
    MIN(mu."UnionDate") AS "FirstUnionDate",
    MAX(mu."UnionDate") AS "LastUnionDate"
FROM "Wedding" w
JOIN "Person" p1 ON w."ManID" = p1."PersonID"
JOIN "Person" p2 ON w."WomanID" = p2."PersonID"
LEFT JOIN "Family" f ON w."PatrilinealFamilyID" = f."FamilyID"
LEFT JOIN "MarriageUnion" mu ON w."WeddingID" = mu."WeddingID"
GROUP BY w."WeddingID", p1."FirstName", p1."LastName", 
         p2."FirstName", p2."LastName", f."FamilyName";

-- Vue : Personnes avec leurs lignages
CREATE OR REPLACE VIEW "PersonLineage" AS
SELECT 
    p."PersonID",
    p."FirstName",
    p."LastName",
    p."Sex",
    p."FamilyID" AS "CurrentFamilyID",
    f1."FamilyName" AS "CurrentFamilyName",
    p."PaternalFamilyID",
    f2."FamilyName" AS "PaternalFamilyName",
    p."MaternalFamilyID",
    f3."FamilyName" AS "MaternalFamilyName",
    CASE 
        WHEN p."PaternalFamilyID" = p."MaternalFamilyID" THEN 'Même famille'
        WHEN p."PaternalFamilyID" IS NOT NULL AND p."MaternalFamilyID" IS NOT NULL THEN 'Double lignage'
        WHEN p."PaternalFamilyID" IS NOT NULL THEN 'Lignage paternel uniquement'
        WHEN p."MaternalFamilyID" IS NOT NULL THEN 'Lignage maternel uniquement'
        ELSE 'Aucun lignage'
    END AS "LineageType"
FROM "Person" p
LEFT JOIN "Family" f1 ON p."FamilyID" = f1."FamilyID"
LEFT JOIN "Family" f2 ON p."PaternalFamilyID" = f2."FamilyID"
LEFT JOIN "Family" f3 ON p."MaternalFamilyID" = f3."FamilyID";

-- Vue : Relations familiales complètes
CREATE OR REPLACE VIEW "FamilyRelationComplete" AS
SELECT 
    fr."RelationID",
    fr."PersonID",
    p."FirstName" || ' ' || p."LastName" AS "PersonName",
    fr."FamilyID",
    f."FamilyName",
    fr."RelationType",
    fr."StartDate",
    fr."EndDate",
    CASE 
        WHEN fr."EndDate" IS NULL THEN 'Active'
        ELSE 'Terminée'
    END AS "Status"
FROM "FamilyRelation" fr
JOIN "Person" p ON fr."PersonID" = p."PersonID"
JOIN "Family" f ON fr."FamilyID" = f."FamilyID";

-- ================================================
-- PARTIE 7 : VÉRIFICATIONS
-- ================================================

-- Vérifier les mariages avec unions
SELECT 
    'Mariages avec unions' AS "Type",
    COUNT(*) AS "Total"
FROM "MarriageComplete"
WHERE "UnionCount" > 0
UNION ALL
SELECT 
    'Relations d''alliance' AS "Type",
    COUNT(*) AS "Total"
FROM "FamilyRelation"
UNION ALL
SELECT 
    'Personnes avec double lignage' AS "Type",
    COUNT(*) AS "Total"
FROM "PersonLineage"
WHERE "LineageType" = 'Double lignage';

-- ================================================
-- PARTIE 8 : EXEMPLES D'UTILISATION
-- ================================================

-- Exemple 1 : Ajouter les 3 types d'unions pour un mariage
/*
INSERT INTO "MarriageUnion" ("WeddingID", "UnionType", "UnionDate", "Location", "Validated")
VALUES 
    (1, 'coutumière', '2015-06-12', 'Village Mbalmayo', TRUE),
    (1, 'civile', '2016-07-20', 'Mairie de Yaoundé', TRUE),
    (1, 'religieuse', '2017-08-05', 'Cathédrale de Douala', TRUE);
*/

-- Exemple 2 : Définir le double lignage d'une personne
/*
UPDATE "Person"
SET 
    "PaternalFamilyID" = 1, -- Famille du père
    "MaternalFamilyID" = 2  -- Famille de la mère
WHERE "PersonID" = 10;
*/

-- Exemple 3 : Ajouter une relation "gendre"
/*
INSERT INTO "FamilyRelation" ("PersonID", "FamilyID", "RelationType", "StartDate")
VALUES (5, 2, 'gendre', '2020-05-15');
*/

-- ================================================
-- PARTIE 9 : FONCTIONS UTILES
-- ================================================

-- Fonction : Obtenir tous les gendres d'une famille
CREATE OR REPLACE FUNCTION get_gendres(family_id INTEGER)
RETURNS TABLE (
    person_id INTEGER,
    person_name TEXT,
    marriage_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fr."PersonID",
        p."FirstName" || ' ' || p."LastName",
        fr."StartDate"
    FROM "FamilyRelation" fr
    JOIN "Person" p ON fr."PersonID" = p."PersonID"
    WHERE fr."FamilyID" = family_id
      AND fr."RelationType" = 'gendre'
      AND (fr."EndDate" IS NULL OR fr."EndDate" > CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Fonction : Obtenir toutes les unions d'un mariage
CREATE OR REPLACE FUNCTION get_marriage_unions(wedding_id INTEGER)
RETURNS TABLE (
    union_type VARCHAR(20),
    union_date DATE,
    location TEXT,
    validated BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        "UnionType",
        "UnionDate",
        "Location",
        "Validated"
    FROM "MarriageUnion"
    WHERE "WeddingID" = wedding_id
    ORDER BY "UnionDate";
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FIN DE LA MIGRATION
-- ================================================

-- Afficher le résumé
SELECT 
    '✅ Migration terminée' AS "Statut",
    (SELECT COUNT(*) FROM "MarriageUnion") AS "Unions créées",
    (SELECT COUNT(*) FROM "FamilyRelation") AS "Relations d''alliance",
    (SELECT COUNT(*) FROM "PersonLineage" WHERE "LineageType" = 'Double lignage') AS "Personnes double lignage";
