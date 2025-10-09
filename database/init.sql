-- Script d'initialisation de la base de données FamilyTree

-- Création des tables

CREATE TABLE IF NOT EXISTS "City" (
    "CityID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "CountryName" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Family" (
    "FamilyID" SERIAL PRIMARY KEY,
    "FamilyName" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "CreatedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Person" (
    "PersonID" SERIAL PRIMARY KEY,
    "LastName" VARCHAR(100) NOT NULL,
    "FirstName" VARCHAR(100) NOT NULL,
    "Birthday" DATE,
    "Email" VARCHAR(255),
    "Sex" CHAR(1) NOT NULL CHECK ("Sex" IN ('M', 'F')),
    "Activity" VARCHAR(200),
    "Alive" BOOLEAN NOT NULL DEFAULT TRUE,
    "DeathDate" DATE,
    "PhotoUrl" VARCHAR(500),
    "Notes" TEXT,
    "FatherID" INTEGER,
    "MotherID" INTEGER,
    "CityID" INTEGER NOT NULL,
    "FamilyID" INTEGER NOT NULL,
    CONSTRAINT "FK_Person_Father" FOREIGN KEY ("FatherID") REFERENCES "Person"("PersonID") ON DELETE SET NULL,
    CONSTRAINT "FK_Person_Mother" FOREIGN KEY ("MotherID") REFERENCES "Person"("PersonID") ON DELETE SET NULL,
    CONSTRAINT "FK_Person_City" FOREIGN KEY ("CityID") REFERENCES "City"("CityID") ON DELETE RESTRICT,
    CONSTRAINT "FK_Person_Family" FOREIGN KEY ("FamilyID") REFERENCES "Family"("FamilyID") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Wedding" (
    "WeddingID" SERIAL PRIMARY KEY,
    "ManID" INTEGER NOT NULL,
    "WomanID" INTEGER NOT NULL,
    "WeddingDate" DATE NOT NULL,
    "DivorceDate" DATE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "Location" VARCHAR(200),
    "Notes" TEXT,
    CONSTRAINT "FK_Wedding_Man" FOREIGN KEY ("ManID") REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    CONSTRAINT "FK_Wedding_Woman" FOREIGN KEY ("WomanID") REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    CONSTRAINT "CHK_Wedding_DifferentPersons" CHECK ("ManID" != "WomanID")
);

CREATE TABLE IF NOT EXISTS "Connexion" (
    "ConnexionID" SERIAL PRIMARY KEY,
    "UserName" VARCHAR(100) NOT NULL UNIQUE,
    "Password" VARCHAR(255) NOT NULL,
    "Level" INTEGER NOT NULL DEFAULT 1 CHECK ("Level" BETWEEN 1 AND 3),
    "IDPerson" INTEGER NOT NULL UNIQUE,
    "FamilyID" INTEGER NOT NULL,
    "Email" VARCHAR(255) UNIQUE,
    "CreatedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastLoginDate" TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT "FK_Connexion_Person" FOREIGN KEY ("IDPerson") REFERENCES "Person"("PersonID") ON DELETE CASCADE,
    CONSTRAINT "FK_Connexion_Family" FOREIGN KEY ("FamilyID") REFERENCES "Family"("FamilyID") ON DELETE CASCADE
);

-- Insertion de données de test

-- Villes
INSERT INTO "City" ("Name", "CountryName") VALUES
('Paris', 'France'),
('Lyon', 'France'),
('Marseille', 'France'),
('Yaoundé', 'Cameroun'),
('Douala', 'Cameroun'),
('New York', 'États-Unis'),
('Londres', 'Royaume-Uni');

-- Famille
INSERT INTO "Family" ("FamilyName", "Description") VALUES
('Famille Dupont', 'Famille de démonstration');

-- Personnes (génération 1 - grands-parents)
INSERT INTO "Person" ("LastName", "FirstName", "Birthday", "Sex", "Activity", "CityID", "FamilyID") VALUES
('Dupont', 'Jean', '1950-05-15', 'M', 'Retraité', 1, 1),
('Martin', 'Marie', '1952-08-20', 'F', 'Retraitée', 1, 1);

-- Personnes (génération 2 - parents)
INSERT INTO "Person" ("LastName", "FirstName", "Birthday", "Sex", "Activity", "FatherID", "MotherID", "CityID", "FamilyID") VALUES
('Dupont', 'Pierre', '1975-03-10', 'M', 'Ingénieur', 1, 2, 2, 1),
('Bernard', 'Sophie', '1977-11-25', 'F', 'Médecin', NULL, NULL, 2, 1);

-- Mariage
INSERT INTO "Wedding" ("ManID", "WomanID", "WeddingDate", "Location") VALUES
(3, 4, '2000-06-15', 'Lyon, France');

-- Personnes (génération 3 - enfants)
INSERT INTO "Person" ("LastName", "FirstName", "Birthday", "Sex", "Activity", "FatherID", "MotherID", "CityID", "FamilyID") VALUES
('Dupont', 'Lucas', '2002-01-20', 'M', 'Étudiant', 3, 4, 1, 1),
('Dupont', 'Emma', '2005-07-14', 'F', 'Lycéenne', 3, 4, 1, 1);

-- Compte utilisateur (mot de passe: "password123" hashé avec bcrypt)
INSERT INTO "Connexion" ("UserName", "Password", "Level", "IDPerson", "FamilyID", "Email") VALUES
('pierre.dupont', '$2a$11$oI1IcI0CBlPvazQRwJFrk.xAWgWvsISBqnBeeByvZy3h3D4dmszhy', 3, 3, 1, 'pierre.dupont@example.com');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "IDX_Person_Father" ON "Person"("FatherID");
CREATE INDEX IF NOT EXISTS "IDX_Person_Mother" ON "Person"("MotherID");
CREATE INDEX IF NOT EXISTS "IDX_Person_Family" ON "Person"("FamilyID");
CREATE INDEX IF NOT EXISTS "IDX_Person_City" ON "Person"("CityID");
CREATE INDEX IF NOT EXISTS "IDX_Wedding_Man" ON "Wedding"("ManID");
CREATE INDEX IF NOT EXISTS "IDX_Wedding_Woman" ON "Wedding"("WomanID");
CREATE INDEX IF NOT EXISTS "IDX_Connexion_Person" ON "Connexion"("IDPerson");
CREATE INDEX IF NOT EXISTS "IDX_Connexion_Family" ON "Connexion"("FamilyID");
