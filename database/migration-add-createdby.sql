-- Migration : Ajouter le champ CreatedBy pour tracer qui a créé chaque membre
-- Date : 8 octobre 2025

-- Étape 1 : Ajouter la colonne CreatedBy (nullable)
ALTER TABLE "Person" 
ADD COLUMN IF NOT EXISTS "CreatedBy" INTEGER;

-- Étape 2 : Ajouter la foreign key vers Connexion
ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_Connexion_CreatedBy" 
FOREIGN KEY ("CreatedBy") REFERENCES "Connexion"("ConnexionID")
ON DELETE SET NULL;

-- Étape 3 : Créer un index pour les performances
CREATE INDEX IF NOT EXISTS "IX_Person_CreatedBy" ON "Person"("CreatedBy");

-- Étape 4 : Mise à jour des données existantes (optionnel)
-- Attribuer le créateur comme étant le premier admin de chaque famille
UPDATE "Person" p
SET "CreatedBy" = (
    SELECT c."ConnexionID"
    FROM "Connexion" c
    WHERE c."FamilyID" = p."FamilyID"
      AND c."Role" = 'Admin'
    ORDER BY c."CreatedDate" ASC
    LIMIT 1
)
WHERE "CreatedBy" IS NULL;

-- Vérification
SELECT 
    p."PersonID",
    p."FirstName",
    p."LastName",
    p."CreatedBy",
    c."UserName" as "CreatedByUser"
FROM "Person" p
LEFT JOIN "Connexion" c ON p."CreatedBy" = c."ConnexionID"
ORDER BY p."PersonID"
LIMIT 10;

COMMIT;
