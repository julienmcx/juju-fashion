-- Tracking des essayages pour rate-limiting
CREATE TABLE IF NOT EXISTS essayages_log (
    id_essayage SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE,
    id_article INT REFERENCES articles (id_article) ON DELETE SET NULL,
    cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    statut VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (
        statut IN ('success', 'partial', 'error')
    )
);

CREATE INDEX IF NOT EXISTS idx_essayages_user_date ON essayages_log (id_utilisateur, cree_le);

-- Enrichissement de essayages_log pour stocker les essayages complets
ALTER TABLE essayages_log
ADD COLUMN IF NOT EXISTS image_url_face TEXT,
ADD COLUMN IF NOT EXISTS image_url_profil_droit TEXT,
ADD COLUMN IF NOT EXISTS image_url_dos TEXT,
ADD COLUMN IF NOT EXISTS image_url_profil_gauche TEXT,
ADD COLUMN IF NOT EXISTS vetement_image_url TEXT,
ADD COLUMN IF NOT EXISTS vetement_nom TEXT,
ADD COLUMN IF NOT EXISTS categorie_nom TEXT,
ADD COLUMN IF NOT EXISTS saved BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_essayages_log_saved ON essayages_log (
    id_utilisateur,
    saved,
    cree_le DESC
)
WHERE
    saved = TRUE;

-- =====================================================================
-- Premium / abonnement Stripe (essayages illimités)
-- =====================================================================
ALTER TABLE utilisateurs
    ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS subscription_status    VARCHAR(30),  -- active, trialing, past_due, canceled...
    ADD COLUMN IF NOT EXISTS premium_until          TIMESTAMPTZ;  -- fin de période payée (current_period_end)

CREATE INDEX IF NOT EXISTS idx_utilisateurs_stripe_customer
    ON utilisateurs (stripe_customer_id);