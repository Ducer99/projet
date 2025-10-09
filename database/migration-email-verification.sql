-- ============================================
-- Migration: Email Verification System
-- Description: Ajoute la vérification d'email pour les nouveaux comptes
-- Date: 9 octobre 2025
-- ============================================

-- 1. Ajouter les colonnes de vérification à la table Connexion
ALTER TABLE "Connexion" 
ADD COLUMN IF NOT EXISTS "EmailVerified" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "EmailVerificationCode" VARCHAR(6),
ADD COLUMN IF NOT EXISTS "EmailVerificationExpiry" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "EmailVerificationSentAt" TIMESTAMP;

-- 2. Marquer tous les comptes existants comme vérifiés (pour ne pas casser l'existant)
UPDATE "Connexion" 
SET "EmailVerified" = TRUE 
WHERE "EmailVerified" IS NULL OR "EmailVerified" = FALSE;

-- 3. Créer une fonction pour générer un code de vérification
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    code VARCHAR(6);
BEGIN
    -- Générer un code à 6 chiffres
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer une fonction pour vérifier si le code est valide
CREATE OR REPLACE FUNCTION is_verification_code_valid(
    p_email VARCHAR,
    p_code VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM "Connexion"
        WHERE "Email" = p_email
        AND "EmailVerificationCode" = p_code
        AND "EmailVerificationExpiry" > NOW()
        AND "EmailVerified" = FALSE
    ) INTO v_valid;
    
    RETURN v_valid;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer une vue pour les comptes non vérifiés
CREATE OR REPLACE VIEW "UnverifiedAccounts" AS
SELECT 
    c."ConnexionID",
    c."Email",
    c."UserName",
    c."EmailVerificationCode",
    c."EmailVerificationExpiry",
    c."EmailVerificationSentAt",
    c."CreatedDate",
    CASE 
        WHEN c."EmailVerificationExpiry" < NOW() THEN 'expired'
        WHEN c."EmailVerificationExpiry" IS NULL THEN 'not_sent'
        ELSE 'pending'
    END AS "Status"
FROM "Connexion" c
WHERE c."EmailVerified" = FALSE
ORDER BY c."CreatedDate" DESC;

-- 6. Index pour optimiser les recherches par code de vérification
CREATE INDEX IF NOT EXISTS idx_connexion_verification_code 
ON "Connexion"("EmailVerificationCode") 
WHERE "EmailVerified" = FALSE;

-- 7. Index pour les comptes non vérifiés
CREATE INDEX IF NOT EXISTS idx_connexion_email_verified 
ON "Connexion"("EmailVerified");

-- 8. Commentaires pour documentation
COMMENT ON COLUMN "Connexion"."EmailVerified" IS 'Indique si l''email a été vérifié';
COMMENT ON COLUMN "Connexion"."EmailVerificationCode" IS 'Code à 6 chiffres envoyé par email';
COMMENT ON COLUMN "Connexion"."EmailVerificationExpiry" IS 'Date d''expiration du code (30 minutes)';
COMMENT ON COLUMN "Connexion"."EmailVerificationSentAt" IS 'Date d''envoi du dernier email de vérification';

COMMENT ON FUNCTION generate_verification_code() IS 'Génère un code de vérification aléatoire à 6 chiffres';
COMMENT ON FUNCTION is_verification_code_valid(VARCHAR, VARCHAR) IS 'Vérifie si un code de vérification est valide pour un email donné';

COMMENT ON VIEW "UnverifiedAccounts" IS 'Liste des comptes en attente de vérification d''email';

-- 9. Afficher un résumé
DO $$
BEGIN
    RAISE NOTICE '✅ Migration Email Verification terminée !';
    RAISE NOTICE '📊 Colonnes ajoutées :';
    RAISE NOTICE '   - EmailVerified (BOOLEAN)';
    RAISE NOTICE '   - EmailVerificationCode (VARCHAR(6))';
    RAISE NOTICE '   - EmailVerificationExpiry (TIMESTAMP)';
    RAISE NOTICE '   - EmailVerificationSentAt (TIMESTAMP)';
    RAISE NOTICE '🔧 Fonctions créées :';
    RAISE NOTICE '   - generate_verification_code()';
    RAISE NOTICE '   - is_verification_code_valid(email, code)';
    RAISE NOTICE '📋 Vue créée : UnverifiedAccounts';
END $$;
