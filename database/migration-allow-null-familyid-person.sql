-- Migration pour permettre FamilyID NULL dans la table Person
-- Permet aux nouvelles personnes d'être créées sans famille assignée

-- Étape 1 : Drop la contrainte FK existante
ALTER TABLE "Person" DROP CONSTRAINT IF EXISTS "FK_Person_Family";

-- Étape 2 : Rendre la colonne nullable
ALTER TABLE "Person" ALTER COLUMN "FamilyID" DROP NOT NULL;

-- Étape 3 : Mettre les FamilyID=0 à NULL (si existants)
UPDATE "Person" SET "FamilyID" = NULL WHERE "FamilyID" = 0;

-- Étape 4 : Recréer la contrainte FK avec ON DELETE SET NULL
ALTER TABLE "Person" ADD CONSTRAINT "FK_Person_Family" 
    FOREIGN KEY ("FamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

-- Ajouter un commentaire
COMMENT ON COLUMN "Person"."FamilyID" IS 'ID de la famille. NULL si personne pas encore rattachée à une famille.';
