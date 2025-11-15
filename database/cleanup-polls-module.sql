-- ================================
-- SUPPRESSION COMPLÈTE MODULE POLLS
-- ================================

-- Suppression des tables dans l'ordre des dépendances
DROP TABLE IF EXISTS "PollVotes" CASCADE;
DROP TABLE IF EXISTS "PollOptions" CASCADE;
DROP TABLE IF EXISTS "Polls" CASCADE;

-- Suppression des vues
DROP VIEW IF EXISTS "PollsWithStats" CASCADE;

-- Suppression des fonctions
DROP FUNCTION IF EXISTS get_poll_results(integer);
DROP FUNCTION IF EXISTS has_user_voted(integer, integer);
DROP FUNCTION IF EXISTS check_poll_end_date();

-- Suppression des triggers
DROP TRIGGER IF EXISTS trigger_check_poll_end_date ON "Polls";

-- Vérification que tout est supprimé
SELECT 'Nettoyage terminé - Module Polls supprimé' as status;
