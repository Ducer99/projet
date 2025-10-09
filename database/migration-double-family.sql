-- ================================================
-- Migration : Système de Double Famille
-- ================================================
-- Une personne peut appartenir à 2 familles (paternelle + maternelle)
-- Mais se connecte à UNE SEULE à la fois

-- 1. Ajouter les colonnes de famille paternelle et maternelle à Person
ALTER TABLE "Person" 
ADD COLUMN "PaternalFamilyID" INTEGER,
ADD COLUMN "MaternalFamilyID" INTEGER;

-- 2. Ajouter les contraintes de clé étrangère
ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_PaternalFamily" 
FOREIGN KEY ("PaternalFamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_MaternalFamily" 
FOREIGN KEY ("MaternalFamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

-- 3. Migrer les données existantes
-- Copier FamilyID actuel vers PaternalFamilyID (on suppose que c'est la famille du père)
UPDATE "Person" SET "PaternalFamilyID" = "FamilyID" WHERE "FamilyID" IS NOT NULL;

-- 4. Ajouter la famille active dans Connexion
ALTER TABLE "Connexion"
ADD COLUMN "ActiveFamilyID" INTEGER;

-- 5. Contrainte de clé étrangère pour ActiveFamilyID
ALTER TABLE "Connexion"
ADD CONSTRAINT "FK_Connexion_ActiveFamily"
FOREIGN KEY ("ActiveFamilyID") REFERENCES "Family"("FamilyID") ON DELETE SET NULL;

-- 6. Migrer les connexions existantes
-- Par défaut, ActiveFamilyID = PaternalFamilyID de la personne
UPDATE "Connexion" c
SET "ActiveFamilyID" = p."PaternalFamilyID"
FROM "Person" p
WHERE c."IDPerson" = p."PersonID";

-- 7. Créer un index pour les recherches
CREATE INDEX "IX_Person_PaternalFamilyID" ON "Person"("PaternalFamilyID");
CREATE INDEX "IX_Person_MaternalFamilyID" ON "Person"("MaternalFamilyID");
CREATE INDEX "IX_Connexion_ActiveFamilyID" ON "Connexion"("ActiveFamilyID");

-- 8. Vérification
SELECT 
    p."PersonID",
    p."FirstName",
    p."LastName",
    p."FamilyID" as "AncienFamilyID",
    p."PaternalFamilyID",
    p."MaternalFamilyID",
    c."ActiveFamilyID"
FROM "Person" p
LEFT JOIN "Connexion" c ON p."PersonID" = c."IDPerson"
ORDER BY p."PersonID";

-- 9. Exemple : Mettre Sophie Bernard dans une famille maternelle différente
-- (Supposons qu'elle vient de la famille Martin - FamilyID=2)
UPDATE "Person" 
SET "MaternalFamilyID" = 2 
WHERE "PersonID" = 4 AND "PaternalFamilyID" = 1;

-- Note: FamilyID est conservé pour compatibilité mais PaternalFamilyID/MaternalFamilyID sont prioritaires
