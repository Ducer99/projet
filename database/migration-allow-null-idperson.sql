-- Migration pour permettre IDPerson NULL dans Connexion
-- Nécessaire pour le nouveau flux d'inscription simplifié

-- 1. Supprimer temporairement la contrainte de clé étrangère
ALTER TABLE "Connexion" DROP CONSTRAINT IF EXISTS "FK_Connexion_Person";

-- 2. Modifier la colonne pour permettre NULL
ALTER TABLE "Connexion" ALTER COLUMN "IDPerson" DROP NOT NULL;

-- 3. Mettre à jour les enregistrements avec IDPerson = 0 pour qu'ils soient NULL
UPDATE "Connexion" SET "IDPerson" = NULL WHERE "IDPerson" = 0;

-- 4. Recréer la contrainte de clé étrangère (permettant NULL)
ALTER TABLE "Connexion" ADD CONSTRAINT "FK_Connexion_Person" 
    FOREIGN KEY ("IDPerson") REFERENCES "Person"("PersonID") 
    ON DELETE SET NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN "Connexion"."IDPerson" IS 'ID de la personne associée (NULL si profil non complété)';
