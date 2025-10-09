-- Fix FK_Event_Creator : Drop et recréer avec ON DELETE SET NULL
-- pour permettre les événements générés automatiquement

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "FK_Event_Creator";

-- 2. Modifier la colonne CreatedBy pour accepter NULL
ALTER TABLE "Event" ALTER COLUMN "CreatedBy" DROP NOT NULL;

-- 3. Recréer la contrainte avec ON DELETE SET NULL
ALTER TABLE "Event" ADD CONSTRAINT "FK_Event_Creator" 
    FOREIGN KEY ("CreatedBy") 
    REFERENCES "Connexion"("ConnexionID") 
    ON DELETE SET NULL;

-- 4. Pour les événements existants sans créateur valide, mettre NULL
UPDATE "Event" 
SET "CreatedBy" = NULL 
WHERE "CreatedBy" NOT IN (SELECT "ConnexionID" FROM "Connexion");

SELECT 'FK_Event_Creator corrigé : CreatedBy peut maintenant être NULL' AS status;
