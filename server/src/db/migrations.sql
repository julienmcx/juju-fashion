-- Tracking des essayages pour rate-limiting
CREATE TABLE IF NOT EXISTS essayages_log (
    id_essayage     SERIAL PRIMARY KEY,
    id_utilisateur  INT NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_article      INT REFERENCES articles(id_article) ON DELETE SET NULL,
    cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    statut          VARCHAR(20) NOT NULL DEFAULT 'success'
                    CHECK (statut IN ('success', 'partial', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_essayages_user_date 
    ON essayages_log(id_utilisateur, cree_le);
