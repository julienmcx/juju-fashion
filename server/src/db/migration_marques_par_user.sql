-- ============================================================
-- Migration : marques privées par utilisateur
-- Juju Fashion — à jouer en LOCAL d'abord, puis en PROD (phpPgAdmin)
-- Colonne réelle : nom_marque
-- ============================================================
-- But : rendre la table "marques" privée à chaque utilisateur.
-- Les articles existants sont préservés (repointés vers la copie
-- de marque appartenant à leur propriétaire).
--
-- Ordre important : on retire l'unicité GLOBALE du nom AVANT de
-- dupliquer les marques par utilisateur, sinon les doublons de nom
-- (ex. deux comptes avec "DivinByDivin") sont refusés.
--
-- NOTE : les marques utilisées par aucun article seront supprimées
-- (étape 5). En test, sans conséquence.
-- ============================================================

BEGIN;

-- 1) Colonne propriétaire (nullable le temps de la migration)
ALTER TABLE marques
ADD COLUMN IF NOT EXISTS id_utilisateur INTEGER REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE;

-- 2) Retirer l'unicité GLOBALE du nom (bloquante pour les copies)
ALTER TABLE marques DROP CONSTRAINT IF EXISTS marques_nom_marque_key;

-- 3) Pour chaque marque réellement utilisée par un utilisateur,
--    créer une copie qui lui appartient (s'il ne l'a pas déjà)
INSERT INTO
    marques (nom_marque, id_utilisateur)
SELECT DISTINCT
    m.nom_marque,
    a.id_utilisateur
FROM articles a
    JOIN marques m ON m.id_marque = a.id_marque
WHERE
    a.id_marque IS NOT NULL
    AND m.id_utilisateur IS NULL
    AND NOT EXISTS (
        SELECT 1
        FROM marques mu
        WHERE
            mu.id_utilisateur = a.id_utilisateur
            AND mu.nom_marque = m.nom_marque
    );

-- 4) Repointer chaque article vers la marque de SON propriétaire
UPDATE articles a
SET
    id_marque = (
        SELECT mu.id_marque
        FROM marques mu
        WHERE
            mu.id_utilisateur = a.id_utilisateur
            AND mu.nom_marque = (
                SELECT nom_marque
                FROM marques
                WHERE
                    id_marque = a.id_marque
            )
    )
WHERE
    a.id_marque IN (
        SELECT id_marque
        FROM marques
        WHERE
            id_utilisateur IS NULL
    );

-- 5) Supprimer les anciennes marques globales (désormais orphelines)
DELETE FROM marques WHERE id_utilisateur IS NULL;

-- 6) Rendre la colonne obligatoire
ALTER TABLE marques ALTER COLUMN id_utilisateur SET NOT NULL;

-- 7) Unicité PAR UTILISATEUR (au lieu d'une unicité globale du nom)
ALTER TABLE marques
ADD CONSTRAINT marques_user_nom_unique UNIQUE (id_utilisateur, nom_marque);

-- 8) Index pour accélérer le filtrage par utilisateur
CREATE INDEX IF NOT EXISTS idx_marques_utilisateur ON marques (id_utilisateur);

COMMIT;

-- Vérif après migration :
--   SELECT id_utilisateur, COUNT(*) FROM marques GROUP BY id_utilisateur;