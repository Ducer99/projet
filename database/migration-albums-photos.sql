-- ========================================
-- Migration : Module Albums Photos
-- Date : 8 octobre 2025
-- Description : Tables pour la gestion des albums photos familiaux
-- ========================================

-- 1. Table Albums
CREATE TABLE IF NOT EXISTS "Album" (
    "AlbumID" SERIAL PRIMARY KEY,
    "FamilyID" INTEGER NOT NULL REFERENCES "Family"("FamilyID") ON DELETE CASCADE,
    "EventID" INTEGER REFERENCES "Event"("EventID") ON DELETE SET NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "CoverPhotoUrl" TEXT,
    "Visibility" VARCHAR(20) NOT NULL DEFAULT 'family', -- 'family', 'private', 'custom'
    "CreatedBy" INTEGER NOT NULL REFERENCES "Connexion"("ConnexionID") ON DELETE RESTRICT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Table Photos
CREATE TABLE IF NOT EXISTS "Photo" (
    "PhotoID" SERIAL PRIMARY KEY,
    "AlbumID" INTEGER NOT NULL REFERENCES "Album"("AlbumID") ON DELETE CASCADE,
    "Url" TEXT NOT NULL,
    "ThumbnailUrl" TEXT,
    "Title" VARCHAR(200),
    "Description" TEXT,
    "DateTaken" DATE,
    "Location" VARCHAR(200),
    "UploadedBy" INTEGER NOT NULL REFERENCES "Connexion"("ConnexionID") ON DELETE RESTRICT,
    "FileSize" BIGINT, -- en bytes
    "Width" INTEGER,
    "Height" INTEGER,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Table PhotoPerson (tagging des personnes sur les photos)
CREATE TABLE IF NOT EXISTS "PhotoPerson" (
    "PhotoPersonID" SERIAL PRIMARY KEY,
    "PhotoID" INTEGER NOT NULL REFERENCES "Photo"("PhotoID") ON DELETE CASCADE,
    "PersonID" INTEGER NOT NULL REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    "PositionX" DECIMAL(5,2), -- Pourcentage 0-100
    "PositionY" DECIMAL(5,2), -- Pourcentage 0-100
    "TaggedBy" INTEGER REFERENCES "Connexion"("ConnexionID") ON DELETE SET NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("PhotoID", "PersonID")
);

-- 4. Table AlbumComment (commentaires sur les albums)
CREATE TABLE IF NOT EXISTS "AlbumComment" (
    "CommentID" SERIAL PRIMARY KEY,
    "AlbumID" INTEGER NOT NULL REFERENCES "Album"("AlbumID") ON DELETE CASCADE,
    "AuthorID" INTEGER NOT NULL REFERENCES "Connexion"("ConnexionID") ON DELETE CASCADE,
    "Content" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Table PhotoLike (likes sur les photos)
CREATE TABLE IF NOT EXISTS "PhotoLike" (
    "LikeID" SERIAL PRIMARY KEY,
    "PhotoID" INTEGER NOT NULL REFERENCES "Photo"("PhotoID") ON DELETE CASCADE,
    "UserID" INTEGER NOT NULL REFERENCES "Connexion"("ConnexionID") ON DELETE CASCADE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("PhotoID", "UserID")
);

-- 6. Table AlbumPermission (permissions custom pour les albums privés)
CREATE TABLE IF NOT EXISTS "AlbumPermission" (
    "PermissionID" SERIAL PRIMARY KEY,
    "AlbumID" INTEGER NOT NULL REFERENCES "Album"("AlbumID") ON DELETE CASCADE,
    "UserID" INTEGER REFERENCES "Connexion"("ConnexionID") ON DELETE CASCADE,
    "PersonID" INTEGER REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    "CanView" BOOLEAN DEFAULT TRUE,
    "CanComment" BOOLEAN DEFAULT TRUE,
    "CanAddPhotos" BOOLEAN DEFAULT FALSE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK ("UserID" IS NOT NULL OR "PersonID" IS NOT NULL)
);

-- Index pour performances
CREATE INDEX idx_album_family ON "Album"("FamilyID");
CREATE INDEX idx_album_event ON "Album"("EventID");
CREATE INDEX idx_album_created_by ON "Album"("CreatedBy");
CREATE INDEX idx_photo_album ON "Photo"("AlbumID");
CREATE INDEX idx_photo_uploaded_by ON "Photo"("UploadedBy");
CREATE INDEX idx_photo_person_photo ON "PhotoPerson"("PhotoID");
CREATE INDEX idx_photo_person_person ON "PhotoPerson"("PersonID");
CREATE INDEX idx_album_comment_album ON "AlbumComment"("AlbumID");
CREATE INDEX idx_photo_like_photo ON "PhotoLike"("PhotoID");
CREATE INDEX idx_album_permission_album ON "AlbumPermission"("AlbumID");

-- Trigger pour UpdatedAt
CREATE OR REPLACE FUNCTION update_album_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_album_update
    BEFORE UPDATE ON "Album"
    FOR EACH ROW
    EXECUTE FUNCTION update_album_timestamp();

CREATE TRIGGER trigger_album_comment_update
    BEFORE UPDATE ON "AlbumComment"
    FOR EACH ROW
    EXECUTE FUNCTION update_album_timestamp();

-- Vue pour statistiques des albums
CREATE OR REPLACE VIEW "AlbumStats" AS
SELECT 
    a."AlbumID",
    a."Title",
    a."FamilyID",
    a."CreatedBy",
    a."Visibility",
    a."CreatedAt",
    COUNT(DISTINCT p."PhotoID") as "PhotoCount",
    COUNT(DISTINCT pp."PersonID") as "TaggedPersonsCount",
    COUNT(DISTINCT ac."CommentID") as "CommentCount",
    COUNT(DISTINCT pl."LikeID") as "TotalLikes",
    MAX(p."CreatedAt") as "LastPhotoAddedAt"
FROM "Album" a
LEFT JOIN "Photo" p ON a."AlbumID" = p."AlbumID"
LEFT JOIN "PhotoPerson" pp ON p."PhotoID" = pp."PhotoID"
LEFT JOIN "AlbumComment" ac ON a."AlbumID" = ac."AlbumID"
LEFT JOIN "PhotoLike" pl ON p."PhotoID" = pl."PhotoID"
GROUP BY a."AlbumID", a."Title", a."FamilyID", a."CreatedBy", a."Visibility", a."CreatedAt";

-- Vue pour les photos avec détails
CREATE OR REPLACE VIEW "PhotoDetails" AS
SELECT 
    p."PhotoID",
    p."AlbumID",
    p."Url",
    p."ThumbnailUrl",
    p."Title",
    p."Description",
    p."DateTaken",
    p."Location",
    p."UploadedBy",
    p."CreatedAt",
    c."UserName" as "UploaderName",
    COUNT(DISTINCT pp."PersonID") as "TaggedCount",
    COUNT(DISTINCT pl."LikeID") as "LikeCount",
    STRING_AGG(DISTINCT (per."FirstName" || ' ' || per."LastName"), ', ' ORDER BY (per."FirstName" || ' ' || per."LastName")) as "TaggedPersons"
FROM "Photo" p
LEFT JOIN "Connexion" c ON p."UploadedBy" = c."ConnexionID"
LEFT JOIN "PhotoPerson" pp ON p."PhotoID" = pp."PhotoID"
LEFT JOIN "Person" per ON pp."PersonID" = per."PersonID"
LEFT JOIN "PhotoLike" pl ON p."PhotoID" = pl."PhotoID"
GROUP BY p."PhotoID", p."AlbumID", p."Url", p."ThumbnailUrl", p."Title", 
         p."Description", p."DateTaken", p."Location", p."UploadedBy", p."CreatedAt", c."UserName";

-- Données de démo
INSERT INTO "Album" ("FamilyID", "Title", "Description", "Visibility", "CreatedBy") 
VALUES 
    (1, 'Souvenirs de famille', 'Album regroupant nos plus beaux moments familiaux', 'family', 1),
    (1, 'Mariages', 'Cérémonies de mariage de la famille', 'family', 1),
    (1, 'Enfance', 'Photos des enfants', 'family', 1)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE "Album" IS 'Albums photos des familles';
COMMENT ON TABLE "Photo" IS 'Photos individuelles dans les albums';
COMMENT ON TABLE "PhotoPerson" IS 'Tagging des personnes sur les photos';
COMMENT ON TABLE "AlbumComment" IS 'Commentaires sur les albums';
COMMENT ON TABLE "PhotoLike" IS 'Likes sur les photos';
COMMENT ON TABLE "AlbumPermission" IS 'Permissions granulaires pour albums privés';

-- ✅ Migration terminée
SELECT 'Migration Albums Photos terminée avec succès!' as status;
