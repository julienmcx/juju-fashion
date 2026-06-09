ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS favori BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_articles_favori
  ON articles (id_utilisateur, favori)
  WHERE favori = TRUE;