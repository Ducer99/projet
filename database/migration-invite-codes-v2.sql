-- Migration: Système d'invitation par code
-- Version: 2 (Compatible EF Core)
-- Date: 2025-10-07

BEGIN;

-- 1. Ajouter les colonnes à la table Family
ALTER TABLE "Family" 
ADD COLUMN "InviteCode" VARCHAR(20),
ADD COLUMN "CreatedBy" INTEGER;

-- 2. Ajouter la colonne Role à Connexion
ALTER TABLE "Connexion" 
ADD COLUMN "Role" VARCHAR(20) DEFAULT 'Member';

-- 3. Créer l'index unique sur InviteCode
CREATE UNIQUE INDEX "IX_Family_InviteCode" ON "Family"("InviteCode");

-- 4. Ajouter les foreign keys
ALTER TABLE "Family"
ADD CONSTRAINT "FK_Family_Person_CreatedBy" 
FOREIGN KEY ("CreatedBy") 
REFERENCES "Person"("PersonID") 
ON DELETE RESTRICT;

-- 5. Fonction de génération de code d'invitation
CREATE OR REPLACE FUNCTION generate_invite_code(family_name TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Extraire les 3 premières lettres (ou compléter avec X)
    prefix := UPPER(SUBSTRING(family_name FROM 1 FOR 3));
    IF LENGTH(prefix) < 3 THEN
        prefix := RPAD(prefix, 3, 'X');
    END IF;
    
    -- Générer un code unique
    LOOP
        code := prefix || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM "Family" WHERE "InviteCode" = code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 6. Générer des codes pour les familles existantes
UPDATE "Family" 
SET "InviteCode" = generate_invite_code("FamilyName")
WHERE "InviteCode" IS NULL;

-- 7. Définir les créateurs pour les familles existantes (premier membre de chaque famille)
UPDATE "Family" f
SET "CreatedBy" = (
    SELECT p."PersonID" 
    FROM "Person" p 
    WHERE p."FamilyID" = f."FamilyID" 
    ORDER BY p."PersonID" 
    LIMIT 1
)
WHERE "CreatedBy" IS NULL;

-- 8. Mettre à jour les rôles pour les créateurs (Admin)
UPDATE "Connexion" c
SET "Role" = 'Admin'
WHERE c."IDPerson" IN (
    SELECT f."CreatedBy" 
    FROM "Family" f 
    WHERE f."CreatedBy" IS NOT NULL
);

COMMIT;

-- Vérification des données
SELECT 
    f."FamilyID",
    f."FamilyName",
    f."InviteCode",
    p."FirstName" || ' ' || p."LastName" AS "CreatedBy",
    (SELECT COUNT(*) FROM "Connexion" c WHERE c."FamilyID" = f."FamilyID") AS "MembersCount"
FROM "Family" f
LEFT JOIN "Person" p ON f."CreatedBy" = p."PersonID"
ORDER BY f."FamilyID";
