-- Migration: Ajout du champ ProfileCompleted à la table Connexion
-- Date: 2025-10-07
-- Description: Support du nouveau flow d'inscription simplifié

-- Ajout de la colonne ProfileCompleted
ALTER TABLE "Connexion" 
ADD COLUMN IF NOT EXISTS "ProfileCompleted" BOOLEAN DEFAULT false;

-- Mettre tous les comptes existants comme "profil complété"
UPDATE "Connexion" 
SET "ProfileCompleted" = true 
WHERE "IDPerson" > 0;

-- Les comptes sans personne associée sont considérés comme incomplets
UPDATE "Connexion" 
SET "ProfileCompleted" = false,
    "IsActive" = false
WHERE "IDPerson" = 0 OR "IDPerson" IS NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN "Connexion"."ProfileCompleted" IS 'Indique si l utilisateur a complété son profil personnel après inscription';
