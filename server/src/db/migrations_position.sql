-- Ordre personnalisé des articles dans la garde-robe (drag & drop)
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS position INT;

-- Backfill : on conserve l'ordre actuel (les plus récents en premier)
-- en attribuant une position croissante par utilisateur.
WITH ordered AS (
  SELECT
    id_article,
    ROW_NUMBER() OVER (
      PARTITION BY id_utilisateur
      ORDER BY cree_le DESC, id_article DESC
    ) - 1 AS pos
  FROM articles
  WHERE position IS NULL
)
UPDATE articles a
SET position = ordered.pos
FROM ordered
WHERE a.id_article = ordered.id_article;

CREATE INDEX IF NOT EXISTS idx_articles_position
  ON articles (id_utilisateur, position);
