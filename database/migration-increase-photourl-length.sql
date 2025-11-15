-- Migration: Augmenter la taille du champ PhotoUrl
-- Date: 2025-10-13
-- Raison: L'URL base64 des photos peut dépasser 500 caractères

-- Augmenter la limite de PhotoUrl à 2000 caractères
ALTER TABLE "Person" 
ALTER COLUMN "PhotoUrl" TYPE VARCHAR(2000);

-- Vérification
SELECT column_name, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'Person' AND column_name = 'PhotoUrl';

-- Commentaire explicatif
COMMENT ON COLUMN "Person"."PhotoUrl" IS 'URL de la photo du profil (max 2000 caractères pour supporter les URLs longues et base64)';
