-- ============================================
-- MODULE SONDAGES FAMILIAUX
-- Migration pour ajouter les tables de sondages
-- ============================================

-- Table des sondages
CREATE TABLE IF NOT EXISTS Polls (
    PollID SERIAL PRIMARY KEY,
    FamilyID INT NOT NULL REFERENCES "Family"("FamilyID") ON DELETE CASCADE,
    CreatorID INT NOT NULL REFERENCES "Person"("PersonID"),
    Question TEXT NOT NULL,
    PollType VARCHAR(20) NOT NULL CHECK (PollType IN ('single', 'multiple')),
    -- single = choix unique, multiple = choix multiple
    Description TEXT,
    StartDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EndDate TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des options de sondage
CREATE TABLE IF NOT EXISTS PollOptions (
    OptionID SERIAL PRIMARY KEY,
    PollID INT NOT NULL REFERENCES Polls(PollID) ON DELETE CASCADE,
    OptionText VARCHAR(200) NOT NULL,
    OptionOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des votes
CREATE TABLE IF NOT EXISTS PollVotes (
    VoteID SERIAL PRIMARY KEY,
    PollID INT NOT NULL REFERENCES Polls(PollID) ON DELETE CASCADE,
    OptionID INT NOT NULL REFERENCES PollOptions(OptionID) ON DELETE CASCADE,
    VoterID INT NOT NULL REFERENCES "Person"("PersonID"),
    VotedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Contrainte : un utilisateur ne peut voter qu'une fois par sondage (choix unique)
    -- Pour choix multiple : plusieurs votes du même user autorisés mais limités
    UNIQUE(PollID, VoterID, OptionID)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_polls_family ON Polls(FamilyID);
CREATE INDEX IF NOT EXISTS idx_polls_active ON Polls(IsActive, EndDate);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON PollOptions(PollID);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON PollVotes(PollID);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter ON PollVotes(VoterID);

-- Fonction pour obtenir les résultats d'un sondage
CREATE OR REPLACE FUNCTION get_poll_results(poll_id_param INT)
RETURNS TABLE (
    option_id INT,
    option_text VARCHAR(200),
    vote_count BIGINT,
    vote_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.OptionID,
        po.OptionText,
        COUNT(pv.VoteID) AS VoteCount,
        CASE 
            WHEN (SELECT COUNT(*) FROM PollVotes WHERE PollID = poll_id_param) = 0 THEN 0
            ELSE ROUND((COUNT(pv.VoteID)::DECIMAL / 
                 (SELECT COUNT(*) FROM PollVotes WHERE PollID = poll_id_param) * 100), 2)
        END AS VotePercentage
    FROM PollOptions po
    LEFT JOIN PollVotes pv ON po.OptionID = pv.OptionID
    WHERE po.PollID = poll_id_param
    GROUP BY po.OptionID, po.OptionText, po.OptionOrder
    ORDER BY po.OptionOrder;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur a déjà voté
CREATE OR REPLACE FUNCTION has_user_voted(poll_id_param INT, user_id_param INT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM PollVotes 
        WHERE PollID = poll_id_param 
        AND VoterID = user_id_param
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction trigger pour mettre à jour UpdatedAt
CREATE OR REPLACE FUNCTION update_poll_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poll_timestamp
BEFORE UPDATE ON Polls
FOR EACH ROW
EXECUTE FUNCTION update_poll_timestamp();

-- Données de test
INSERT INTO Polls (FamilyID, CreatorID, Question, PollType, Description, EndDate)
VALUES 
    (1, 1, 'Où organiser la prochaine réunion familiale ?', 'single', 
     'Aidez-nous à choisir le lieu de notre prochaine grande réunion.', 
     CURRENT_TIMESTAMP + INTERVAL '7 days'),
    (1, 1, 'Quels plats souhaitez-vous au repas de famille ?', 'multiple', 
     'Vous pouvez sélectionner plusieurs plats que vous aimeriez voir au menu.', 
     CURRENT_TIMESTAMP + INTERVAL '5 days'),
    (1, 1, 'Quel jour préférez-vous pour la célébration ?', 'single', 
     'Choisissez le jour qui vous convient le mieux.', 
     CURRENT_TIMESTAMP + INTERVAL '10 days');

-- Options pour le premier sondage (Lieu de réunion)
INSERT INTO PollOptions (PollID, OptionText, OptionOrder)
VALUES 
    (1, 'Chez Grand-mère Marie', 1),
    (1, 'Au parc municipal', 2),
    (1, 'À la salle communautaire', 3),
    (1, 'Restaurant "Le Jardin"', 4);

-- Options pour le deuxième sondage (Plats)
INSERT INTO PollOptions (PollID, OptionText, OptionOrder)
VALUES 
    (2, 'Poulet rôti traditionnel', 1),
    (2, 'Riz jaune aux légumes', 2),
    (2, 'Beignets de banane', 3),
    (2, 'Jus de gingembre maison', 4),
    (2, 'Salade tropicale', 5);

-- Options pour le troisième sondage (Jour)
INSERT INTO PollOptions (PollID, OptionText, OptionOrder)
VALUES 
    (3, 'Samedi 15 novembre', 1),
    (3, 'Dimanche 16 novembre', 2),
    (3, 'Samedi 22 novembre', 3);

-- Quelques votes de test
INSERT INTO PollVotes (PollID, OptionID, VoterID)
VALUES 
    (1, 1, 1),  -- Vote pour "Chez Grand-mère"
    (2, 1, 1),  -- Vote pour "Poulet rôti"
    (2, 3, 1);  -- Vote pour "Beignets" (choix multiple)

-- Vue pour afficher les sondages avec statistiques
CREATE OR REPLACE VIEW PollsWithStats AS
SELECT 
    p.PollID,
    p.FamilyID,
    p.CreatorID,
    per."FirstName" || ' ' || per."LastName" AS CreatorName,
    p.Question,
    p.PollType,
    p.Description,
    p.StartDate,
    p.EndDate,
    p.IsActive,
    p.CreatedAt,
    (SELECT COUNT(DISTINCT VoterID) FROM PollVotes WHERE PollID = p.PollID) AS TotalVoters,
    (SELECT COUNT(*) FROM PollOptions WHERE PollID = p.PollID) AS TotalOptions,
    CASE 
        WHEN p.EndDate IS NOT NULL AND p.EndDate < CURRENT_TIMESTAMP THEN FALSE
        ELSE p.IsActive
    END AS IsCurrentlyActive
FROM Polls p
INNER JOIN "Person" per ON p.CreatorID = per."PersonID";

COMMENT ON TABLE Polls IS 'Sondages familiaux - questions posées à la famille';
COMMENT ON TABLE PollOptions IS 'Options de réponse pour chaque sondage';
COMMENT ON TABLE PollVotes IS 'Votes des membres de la famille';
COMMENT ON COLUMN Polls.PollType IS 'Type: single (choix unique) ou multiple (plusieurs choix)';
COMMENT ON COLUMN Polls.EndDate IS 'Date limite de vote - NULL = pas de limite';

SELECT '✅ Module Sondages créé avec succès!' AS status;
