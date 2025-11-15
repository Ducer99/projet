-- Migration : Permettre CreatedBy NULL pour les placeholders
-- Les placeholders n'ont pas de créateur spécifique car ils sont créés automatiquement

-- Étape 1 : Supprimer l'ancienne contrainte de clé étrangère
ALTER TABLE "Person"
DROP CONSTRAINT IF EXISTS "FK_Person_Connexion_CreatedBy";

-- Étape 2 : Recréer la contrainte SANS le NOT NULL
-- La contrainte permet maintenant les valeurs NULL pour CreatedBy
ALTER TABLE "Person"
ADD CONSTRAINT "FK_Person_Connexion_CreatedBy"
FOREIGN KEY ("CreatedBy") REFERENCES "Connexion"("ConnexionID")
ON DELETE SET NULL;  -- Si la connexion est supprimée, on met NULL au lieu de supprimer la personne

-- Vérification
SELECT 
    "PersonID",
    "FirstName",
    "LastName",
    "Status",
    "CreatedBy"
FROM "Person"
WHERE "Status" = 'placeholder'
ORDER BY "PersonID"
LIMIT 10;
