-- Migration: Ajout du système de ciblage des participants aux sondages
-- Date: 2025-11-14
-- Description: Permet de cibler les sondages par audience spécifique

-- 1. Ajouter les colonnes de ciblage à la table polls
ALTER TABLE polls 
ADD COLUMN IF NOT EXISTS visibility_type VARCHAR(20) DEFAULT 'all' CHECK (visibility_type IN ('all', 'lineage', 'generation', 'manual')),
ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS description_visibility TEXT DEFAULT NULL;

-- 2. Créer une table pour les participants manuels (optionnel, pour performance)
CREATE TABLE IF NOT EXISTS poll_participants (
    participant_id SERIAL PRIMARY KEY,
    pollid INT NOT NULL,
    personid INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pollid) REFERENCES polls(pollid) ON DELETE CASCADE,
    FOREIGN KEY (personid) REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    UNIQUE(pollid, personid)
);

-- 3. Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_polls_visibility ON polls(visibility_type);
CREATE INDEX IF NOT EXISTS idx_polls_target_audience ON polls USING gin(target_audience);
CREATE INDEX IF NOT EXISTS idx_poll_participants_pollid ON poll_participants(pollid);
CREATE INDEX IF NOT EXISTS idx_poll_participants_personid ON poll_participants(personid);

-- 4. Mettre à jour les sondages existants pour avoir visibility_type = 'all'
UPDATE polls SET visibility_type = 'all' WHERE visibility_type IS NULL;

-- 5. Commentaires pour la documentation
COMMENT ON COLUMN polls.visibility_type IS 'Type de visibilité: all (tous), lineage (lignée), generation (génération), manual (sélection manuelle)';
COMMENT ON COLUMN polls.target_audience IS 'JSON contenant les critères de ciblage: {familyIds: [1,2], generations: [2,3], personIds: [10,15]}';
COMMENT ON TABLE poll_participants IS 'Table de jointure pour la sélection manuelle de participants à un sondage';

-- Exemples de target_audience JSON:
-- Pour cibler une lignée: {"lineageType": "paternal", "familyIds": [1, 2]}
-- Pour cibler une génération: {"generationLevel": 2, "ancestors": [5, 6]}
-- Pour cibler manuellement: {"personIds": [10, 15, 20]}
