-- ================================================
-- Migration : Système de Code d'Invitation Familial
-- ================================================

-- 1. Ajouter le code d'invitation à la table Family
ALTER TABLE "Family"
ADD COLUMN "InviteCode" VARCHAR(20) UNIQUE,
ADD COLUMN "CreatedBy" INTEGER;

-- 2. Ajouter la contrainte de clé étrangère pour CreatedBy
ALTER TABLE "Family"
ADD CONSTRAINT "FK_Family_CreatedBy"
FOREIGN KEY ("CreatedBy") REFERENCES "Person"("PersonID") ON DELETE SET NULL;

-- 3. Ajouter le rôle dans Connexion
ALTER TABLE "Connexion"
ADD COLUMN "Role" VARCHAR(20) DEFAULT 'Member';

-- Les rôles possibles : 'Admin', 'Moderator', 'Member'

-- 4. Fonction pour générer un code d'invitation
CREATE OR REPLACE FUNCTION generate_invite_code(family_name TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    random_number INTEGER;
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Prendre les 3 premières lettres en majuscule
    prefix := UPPER(SUBSTRING(family_name FROM 1 FOR 3));
    
    -- Si moins de 3 caractères, compléter avec des X
    IF LENGTH(prefix) < 3 THEN
        prefix := RPAD(prefix, 3, 'X');
    END IF;
    
    -- Boucle jusqu'à trouver un code unique
    LOOP
        random_number := FLOOR(RANDOM() * 10000)::INTEGER;
        new_code := prefix || '-' || LPAD(random_number::TEXT, 4, '0');
        
        SELECT EXISTS(SELECT 1 FROM "Family" WHERE "InviteCode" = new_code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 5. Générer les codes pour les familles existantes
UPDATE "Family"
SET "InviteCode" = generate_invite_code("FamilyName")
WHERE "InviteCode" IS NULL;

-- 6. Exemple : Définir Jean comme créateur de la famille Dupont
UPDATE "Family"
SET "CreatedBy" = 1
WHERE "FamilyID" = 1;

-- 7. Mettre Pierre comme Admin (premier inscrit de la famille Dupont)
UPDATE "Connexion"
SET "Role" = 'Admin'
WHERE "IDPerson" = 3;

-- 8. Créer un index sur le code d'invitation
CREATE INDEX "IX_Family_InviteCode" ON "Family"("InviteCode");

-- 9. Vérification
SELECT 
    f."FamilyID",
    f."FamilyName",
    f."InviteCode",
    f."CreatedBy",
    p."FirstName" || ' ' || p."LastName" as "CreatedByName"
FROM "Family" f
LEFT JOIN "Person" p ON f."CreatedBy" = p."PersonID"
ORDER BY f."FamilyID";

-- 10. Vérifier les rôles
SELECT 
    c."ConnexionID",
    c."Email",
    c."Role",
    p."FirstName" || ' ' || p."LastName" as "PersonName",
    f."FamilyName"
FROM "Connexion" c
JOIN "Person" p ON c."IDPerson" = p."PersonID"
JOIN "Family" f ON c."FamilyID" = f."FamilyID"
ORDER BY c."ConnexionID";
