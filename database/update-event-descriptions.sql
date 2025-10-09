-- ========================================
-- 🎂 MISE À JOUR DES DESCRIPTIONS D'ÉVÉNEMENTS
-- ========================================
-- Ce script met à jour les descriptions des événements
-- pour les rendre plus sympas et personnalisées
-- ========================================

-- 🎂 ANNIVERSAIRES : "Joyeux anniversaire [Prénom] !"
UPDATE "Event" e
SET "Description" = '🎂 Joyeux anniversaire ' || p."FirstName" || ' !'
FROM "Person" p
WHERE e."EventType" = 'birthday'
  AND e."Title" LIKE 'Anniversaire de ' || p."FirstName" || ' ' || p."LastName";

-- Afficher le résultat
SELECT 
    'ANNIVERSAIRES' as "Type",
    "EventID",
    "Title",
    "Description"
FROM "Event"
WHERE "EventType" = 'birthday'
ORDER BY "StartDate";

-- 👶 NAISSANCES : "Naissance de [Prénom] [Nom]"
UPDATE "Event" e
SET "Description" = '👶 Naissance de ' || p."FirstName" || ' ' || p."LastName"
FROM "Person" p
WHERE e."EventType" = 'birth'
  AND e."Title" LIKE 'Naissance de ' || p."FirstName" || ' ' || p."LastName";

-- Afficher le résultat
SELECT 
    'NAISSANCES' as "Type",
    "EventID",
    "Title",
    "Description"
FROM "Event"
WHERE "EventType" = 'birth'
ORDER BY "StartDate";

-- 💍 MARIAGES : Ajouter des émojis si manquants
UPDATE "Event"
SET "Description" = '💍 ' || "Description"
WHERE "EventType" = 'marriage'
  AND "Description" NOT LIKE '💍%'
  AND "Description" IS NOT NULL;

-- 🎉 FÊTES : Ajouter des émojis si manquants
UPDATE "Event"
SET "Description" = '🎉 ' || "Description"
WHERE "EventType" = 'party'
  AND "Description" NOT LIKE '🎉%'
  AND "Description" IS NOT NULL;

-- Résumé
SELECT 
    "EventType" as "Type d'événement",
    COUNT(*) as "Nombre",
    COUNT(CASE WHEN "Description" IS NOT NULL THEN 1 END) as "Avec description"
FROM "Event"
GROUP BY "EventType"
ORDER BY "EventType";
