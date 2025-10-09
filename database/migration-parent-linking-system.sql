-- Migration : Système de liaison automatique des parents
-- Date : 2025-10-07
-- Description : Ajoute les colonnes pour gérer parents vivants/décédés/non inscrits

-- 1. Ajouter colonnes pour parents en attente (saisie texte)
ALTER TABLE "Person" 
ADD COLUMN "PendingFatherName" VARCHAR(200),
ADD COLUMN "PendingMotherName" VARCHAR(200);

-- 2. Ajouter statut de la personne (placeholder, confirmed, deceased)
ALTER TABLE "Person" 
ADD COLUMN "Status" VARCHAR(20) DEFAULT 'confirmed',
ADD CONSTRAINT chk_status CHECK ("Status" IN ('placeholder', 'confirmed', 'deceased'));

-- 3. Ajouter traçabilité (qui a créé ce membre)
ALTER TABLE "Person" 
ADD COLUMN "CreatedBy" INTEGER REFERENCES "Connexion"("ConnexionID");

-- 4. Ajouter droit de connexion
ALTER TABLE "Person" 
ADD COLUMN "CanLogin" BOOLEAN DEFAULT TRUE;

-- 5. Ajouter flag de confirmation du lien parent
ALTER TABLE "Person" 
ADD COLUMN "ParentLinkConfirmed" BOOLEAN DEFAULT FALSE;

-- 6. Index pour recherche rapide par nom complet (normalisé)
CREATE INDEX idx_person_fullname_lower 
ON "Person" (LOWER(TRIM("FirstName" || ' ' || "LastName")));

-- 7. Index pour recherche par pending names
CREATE INDEX idx_person_pending_father 
ON "Person" ("PendingFatherName") 
WHERE "PendingFatherName" IS NOT NULL;

CREATE INDEX idx_person_pending_mother 
ON "Person" ("PendingMotherName") 
WHERE "PendingMotherName" IS NOT NULL;

-- 8. Index pour recherche par statut
CREATE INDEX idx_person_status 
ON "Person" ("Status");

-- 9. Mettre à jour les données existantes
-- Marquer toutes les personnes existantes comme "confirmed"
UPDATE "Person" 
SET "Status" = 'confirmed', 
    "CanLogin" = TRUE, 
    "ParentLinkConfirmed" = TRUE
WHERE "Status" IS NULL;

-- 10. Marquer les personnes décédées
UPDATE "Person" 
SET "Status" = 'deceased', 
    "CanLogin" = FALSE
WHERE "Alive" = FALSE OR "DeathDate" IS NOT NULL;

-- 11. Commentaires pour documentation
COMMENT ON COLUMN "Person"."PendingFatherName" IS 'Nom complet du père si non inscrit (ex: "Jean Dupont")';
COMMENT ON COLUMN "Person"."PendingMotherName" IS 'Nom complet de la mère si non inscrite (ex: "Marie Talla")';
COMMENT ON COLUMN "Person"."Status" IS 'Statut: placeholder (vivant non inscrit), confirmed (inscrit), deceased (décédé)';
COMMENT ON COLUMN "Person"."CreatedBy" IS 'ID utilisateur qui a créé ce membre';
COMMENT ON COLUMN "Person"."CanLogin" IS 'Peut se connecter (false pour décédés)';
COMMENT ON COLUMN "Person"."ParentLinkConfirmed" IS 'Lien parent-enfant confirmé par validation';

-- Afficher résumé
SELECT 
    'Migration terminée' AS status,
    COUNT(*) FILTER (WHERE "Status" = 'confirmed') AS confirmed_count,
    COUNT(*) FILTER (WHERE "Status" = 'deceased') AS deceased_count,
    COUNT(*) FILTER (WHERE "Status" = 'placeholder') AS placeholder_count
FROM "Person";
