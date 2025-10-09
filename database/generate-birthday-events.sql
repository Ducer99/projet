-- Script pour générer automatiquement des événements d'anniversaire 
-- à partir des dates de naissance des membres existants

-- Supprimer les anciens événements d'anniversaire générés automatiquement (si besoin)
-- DELETE FROM "Event" WHERE "EventType" = 'birthday' AND "Description" LIKE 'Anniversaire automatique%';

-- Générer un événement d'anniversaire pour chaque personne vivante avec une date de naissance
INSERT INTO "Event" ("FamilyID", "Title", "Description", "StartDate", "EndDate", "EventType", "Location", "Visibility", "IsRecurring", "CreatedBy", "CreatedAt")
SELECT 
    p."FamilyID",
    'Anniversaire de ' || p."FirstName" || ' ' || p."LastName" AS "Title",
    'Anniversaire automatique généré depuis la date de naissance' AS "Description",
    -- Prochaine occurrence de l'anniversaire (année actuelle ou suivante)
    CASE 
        WHEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM p."Birthday")::INT, EXTRACT(DAY FROM p."Birthday")::INT) >= CURRENT_DATE 
        THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM p."Birthday")::INT, EXTRACT(DAY FROM p."Birthday")::INT)
        ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1, EXTRACT(MONTH FROM p."Birthday")::INT, EXTRACT(DAY FROM p."Birthday")::INT)
    END AS "StartDate",
    NULL AS "EndDate",
    'birthday' AS "EventType",
    c."Name" || ', ' || c."CountryName" AS "Location",
    'family' AS "Visibility",
    true AS "IsRecurring", -- Les anniversaires se répètent chaque année
    1 AS "CreatedBy", -- Admin par défaut (ConnexionID = 1)
    CURRENT_TIMESTAMP AS "CreatedAt"
FROM "Person" p
LEFT JOIN "City" c ON p."CityID" = c."CityID"
WHERE p."Birthday" IS NOT NULL 
  AND p."Alive" = true
  AND p."FamilyID" IS NOT NULL -- Ignorer les personnes sans famille
  AND NOT EXISTS (
      -- Ne pas dupliquer si un événement d'anniversaire existe déjà pour cette personne
      SELECT 1 FROM "Event" e 
      WHERE e."EventType" = 'birthday' 
        AND e."Title" LIKE '%' || p."FirstName" || ' ' || p."LastName" || '%'
  );

-- Associer automatiquement chaque personne comme participant de son propre anniversaire
INSERT INTO "EventParticipant" ("EventID", "PersonID", "Status", "RespondedAt")
SELECT 
    e."EventID",
    p."PersonID",
    'confirmed' AS "Status",
    CURRENT_TIMESTAMP AS "RespondedAt"
FROM "Event" e
INNER JOIN "Person" p ON e."Title" LIKE '%' || p."FirstName" || ' ' || p."LastName" || '%'
WHERE e."EventType" = 'birthday'
  AND NOT EXISTS (
      -- Éviter les doublons
      SELECT 1 FROM "EventParticipant" ep 
      WHERE ep."EventID" = e."EventID" 
        AND ep."PersonID" = p."PersonID"
  );

-- Vérification : afficher les événements d'anniversaire créés
SELECT 
    e."EventID",
    e."Title",
    e."StartDate",
    e."Location",
    f."FamilyName",
    COUNT(ep."EventParticipantID") AS "ParticipantCount"
FROM "Event" e
LEFT JOIN "Family" f ON e."FamilyID" = f."FamilyID"
LEFT JOIN "EventParticipant" ep ON e."EventID" = ep."EventID"
WHERE e."EventType" = 'birthday'
GROUP BY e."EventID", e."Title", e."StartDate", e."Location", f."FamilyName"
ORDER BY e."StartDate";
