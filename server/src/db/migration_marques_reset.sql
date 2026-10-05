-- ============================================================
-- Reset + correctif des marques (privées par utilisateur)
-- À jouer en LOCAL d'abord, puis en PROD (phpPgAdmin).
--
-- Corrige : marques partagées entre comptes, doublons, et aligne
-- l'unicité sur une unicité PAR UTILISATEUR + INSENSIBLE À LA CASSE
-- (empêche "Nike" et "nike" en double pour un même compte).
--
-- ⚠️ RESET : toutes les marques sont supprimées. Les articles qui en
-- avaient une perdent simplement leur marque (id_marque -> NULL via la
-- FK ON DELETE SET NULL). AUCUN article n'est supprimé.
-- ============================================================

BEGIN;

-- 1) Reset complet des marques
DELETE FROM marques;

-- 2) Colonne propriétaire (si absente)
ALTER TABLE marques
    ADD COLUMN IF NOT EXISTS id_utilisateur INTEGER
    REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE;

-- 3) Retirer toute ancienne unicité GLOBALE du nom
ALTER TABLE marques DROP CONSTRAINT IF EXISTS marques_nom_marque_key;

-- 4) Propriétaire obligatoire (table vide => sans risque)
ALTER TABLE marques ALTER COLUMN id_utilisateur SET NOT NULL;

-- 5) Unicité PAR UTILISATEUR, insensible à la casse
--    (remplace l'éventuelle contrainte sensible à la casse)
ALTER TABLE marques DROP CONSTRAINT IF EXISTS marques_user_nom_unique;
DROP INDEX IF EXISTS marques_user_nom_unique_ci;
CREATE UNIQUE INDEX marques_user_nom_unique_ci
    ON marques (id_utilisateur, LOWER(nom_marque));

-- 6) Index de filtrage par utilisateur
CREATE INDEX IF NOT EXISTS idx_marques_utilisateur ON marques (id_utilisateur);

COMMIT;

-- Vérif : SELECT id_utilisateur, COUNT(*) FROM marques GROUP BY id_utilisateur;
