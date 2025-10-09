-- ========================================
-- 🎂 CORRECTION AUTOMATIQUE DES DATES D'ANNIVERSAIRE
-- ========================================
-- Ce script met à jour tous les événements anniversaire 
-- pour qu'ils soient à l'année en cours ou suivante
-- ========================================

-- Afficher les dates AVANT correction
SELECT 
    'AVANT CORRECTION' as "Status",
    e."EventID",
    e."Title",
    TO_CHAR(e."StartDate", 'DD/MM/YYYY') as "Date Actuelle",
    EXTRACT(YEAR FROM e."StartDate") as "Année"
FROM "Event" e
WHERE e."EventType" = 'birthday'
ORDER BY e."StartDate";

-- Mise à jour automatique : calculer le prochain anniversaire
UPDATE "Event" e
SET "StartDate" = (
    CASE 
        -- Si l'anniversaire de cette année est passé, prendre l'année prochaine
        WHEN MAKE_DATE(
            EXTRACT(YEAR FROM CURRENT_DATE)::int,
            EXTRACT(MONTH FROM e."StartDate")::int,
            EXTRACT(DAY FROM e."StartDate")::int
        ) < CURRENT_DATE 
        THEN MAKE_DATE(
            EXTRACT(YEAR FROM CURRENT_DATE)::int + 1,
            EXTRACT(MONTH FROM e."StartDate")::int,
            EXTRACT(DAY FROM e."StartDate")::int
        )
        -- Sinon prendre cette année
        ELSE MAKE_DATE(
            EXTRACT(YEAR FROM CURRENT_DATE)::int,
            EXTRACT(MONTH FROM e."StartDate")::int,
            EXTRACT(DAY FROM e."StartDate")::int
        )
    END
)::timestamp
WHERE e."EventType" = 'birthday';

-- Afficher les dates APRÈS correction
SELECT 
    'APRÈS CORRECTION' as "Status",
    e."EventID",
    e."Title",
    TO_CHAR(e."StartDate", 'DD/MM/YYYY') as "Nouvelle Date",
    EXTRACT(YEAR FROM e."StartDate") as "Année",
    CASE 
        WHEN e."StartDate"::date >= CURRENT_DATE THEN '✅ Futur/Aujourd''hui'
        ELSE '⏪ Passé'
    END as "Statut"
FROM "Event" e
WHERE e."EventType" = 'birthday'
ORDER BY e."StartDate";

-- Résumé
SELECT 
    COUNT(*) as "Total anniversaires",
    COUNT(CASE WHEN "StartDate"::date >= CURRENT_DATE THEN 1 END) as "À venir",
    COUNT(CASE WHEN "StartDate"::date < CURRENT_DATE THEN 1 END) as "Passés"
FROM "Event"
WHERE "EventType" = 'birthday';
