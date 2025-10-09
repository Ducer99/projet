-- Migration : Créer les tables pour le module Événements familiaux
-- Date : 8 octobre 2025

-- 📅 Table Event : événements familiaux
CREATE TABLE IF NOT EXISTS "Event" (
    "EventID" SERIAL PRIMARY KEY,
    "FamilyID" INTEGER NOT NULL,
    "Title" VARCHAR(150) NOT NULL,
    "Description" TEXT,
    "StartDate" DATE NOT NULL,
    "EndDate" DATE,
    "EventType" VARCHAR(20) NOT NULL DEFAULT 'other',
    "Location" VARCHAR(200),
    "Visibility" VARCHAR(10) NOT NULL DEFAULT 'family',
    "IsRecurring" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedBy" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP,
    
    CONSTRAINT "FK_Event_Family" FOREIGN KEY ("FamilyID") 
        REFERENCES "Family"("FamilyID") ON DELETE CASCADE,
    CONSTRAINT "FK_Event_Creator" FOREIGN KEY ("CreatedBy") 
        REFERENCES "Connexion"("ConnexionID") ON DELETE RESTRICT,
    CONSTRAINT "CHK_Event_EndDate" CHECK ("EndDate" IS NULL OR "EndDate" >= "StartDate"),
    CONSTRAINT "CHK_Event_Type" CHECK ("EventType" IN ('birth', 'marriage', 'death', 'birthday', 'party', 'other')),
    CONSTRAINT "CHK_Event_Visibility" CHECK ("Visibility" IN ('family', 'private'))
);

-- 👥 Table EventParticipant : participants aux événements
CREATE TABLE IF NOT EXISTS "EventParticipant" (
    "EventParticipantID" SERIAL PRIMARY KEY,
    "EventID" INTEGER NOT NULL,
    "PersonID" INTEGER NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    "RespondedAt" TIMESTAMP,
    
    CONSTRAINT "FK_EventParticipant_Event" FOREIGN KEY ("EventID") 
        REFERENCES "Event"("EventID") ON DELETE CASCADE,
    CONSTRAINT "FK_EventParticipant_Person" FOREIGN KEY ("PersonID") 
        REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    CONSTRAINT "CHK_EventParticipant_Status" CHECK ("Status" IN ('invited', 'confirmed', 'declined')),
    CONSTRAINT "UQ_EventParticipant" UNIQUE ("EventID", "PersonID")
);

-- 📸 Table EventPhoto : photos liées aux événements
CREATE TABLE IF NOT EXISTS "EventPhoto" (
    "EventPhotoID" SERIAL PRIMARY KEY,
    "EventID" INTEGER NOT NULL,
    "PhotoUrl" VARCHAR(500) NOT NULL,
    "Caption" VARCHAR(200),
    "UploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UploadedBy" INTEGER,
    
    CONSTRAINT "FK_EventPhoto_Event" FOREIGN KEY ("EventID") 
        REFERENCES "Event"("EventID") ON DELETE CASCADE,
    CONSTRAINT "FK_EventPhoto_Uploader" FOREIGN KEY ("UploadedBy") 
        REFERENCES "Connexion"("ConnexionID") ON DELETE SET NULL
);

-- 📊 Index pour performances
CREATE INDEX IF NOT EXISTS "IX_Event_FamilyID" ON "Event"("FamilyID");
CREATE INDEX IF NOT EXISTS "IX_Event_CreatedBy" ON "Event"("CreatedBy");
CREATE INDEX IF NOT EXISTS "IX_Event_StartDate" ON "Event"("StartDate");
CREATE INDEX IF NOT EXISTS "IX_Event_EventType" ON "Event"("EventType");

CREATE INDEX IF NOT EXISTS "IX_EventParticipant_EventID" ON "EventParticipant"("EventID");
CREATE INDEX IF NOT EXISTS "IX_EventParticipant_PersonID" ON "EventParticipant"("PersonID");

CREATE INDEX IF NOT EXISTS "IX_EventPhoto_EventID" ON "EventPhoto"("EventID");

-- 🎉 Données de démonstration
INSERT INTO "Event" ("FamilyID", "Title", "Description", "StartDate", "EventType", "Location", "CreatedBy")
SELECT 
    1,
    'Anniversaire de Marie',
    'Célébration du 30ème anniversaire de Marie Martin',
    '2025-12-15',
    'birthday',
    'Paris, France',
    (SELECT "ConnexionID" FROM "Connexion" WHERE "Role" = 'Admin' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM "Family" WHERE "FamilyID" = 1)
AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "Title" = 'Anniversaire de Marie');

INSERT INTO "Event" ("FamilyID", "Title", "Description", "StartDate", "EndDate", "EventType", "Location", "CreatedBy")
SELECT 
    1,
    'Mariage de Paul et Léa',
    'Union de Paul Dupont et Léa Martin',
    '2012-06-25',
    '2012-06-25',
    'marriage',
    'Lyon, France',
    (SELECT "ConnexionID" FROM "Connexion" WHERE "Role" = 'Admin' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM "Family" WHERE "FamilyID" = 1)
AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "Title" = 'Mariage de Paul et Léa');

-- Ajouter des participants pour les événements créés
INSERT INTO "EventParticipant" ("EventID", "PersonID", "Status")
SELECT 
    e."EventID",
    p."PersonID",
    'confirmed'
FROM "Event" e
CROSS JOIN "Person" p
WHERE e."Title" = 'Anniversaire de Marie'
  AND p."FirstName" = 'Marie'
  AND p."LastName" = 'Martin'
  AND NOT EXISTS (
      SELECT 1 FROM "EventParticipant" ep 
      WHERE ep."EventID" = e."EventID" AND ep."PersonID" = p."PersonID"
  )
LIMIT 1;

-- Vérification
SELECT 
    e."EventID",
    e."Title",
    e."EventType",
    e."StartDate",
    e."Location",
    COUNT(ep."EventParticipantID") as "ParticipantCount"
FROM "Event" e
LEFT JOIN "EventParticipant" ep ON e."EventID" = ep."EventID"
GROUP BY e."EventID", e."Title", e."EventType", e."StartDate", e."Location"
ORDER BY e."StartDate" DESC;

COMMIT;
