-- Migration pour permettre FamilyID NULL dans la table Connexion
-- Étape 1 : Drop la contrainte FK existante
ALTER TABLE "Connexion" DROP CONSTRAINT IF EXISTS "FK_Connexion_Family";

-- Étape 2 : Rendre la colonne nullable
ALTER TABLE "Connexion" ALTER COLUMN "FamilyID" DROP NOT NULL;

-- Étape 3 : Mettre les FamilyID=0 à NULL (si existants)
UPDATE "Connexion" SET "FamilyID" = NULL WHERE "FamilyID" = 0;

-- Étape 4 : Recréer la contrainte FK avec ON DELETE SET NULL
ALTER TABLE "Connexion" ADD CONSTRAINT "FK_Connexion_Family" 
    FOREIGN KEY ("FamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

-- Ajouter un commentaire
COMMENT ON COLUMN "Connexion"."FamilyID" IS 'ID de la famille. NULL si utilisateur pas encore rattaché à une famille.';
