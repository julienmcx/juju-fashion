-- Avis (témoignages) de la landing, partagés entre tous les visiteurs.
CREATE TABLE IF NOT EXISTS avis (
    id_avis     SERIAL PRIMARY KEY,
    nom         VARCHAR(40) NOT NULL,
    role        VARCHAR(80),
    texte       VARCHAR(280) NOT NULL,
    note        SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    est_defaut  BOOLEAN NOT NULL DEFAULT FALSE,  -- avis « bêta » fournis au départ
    masque      BOOLEAN NOT NULL DEFAULT FALSE,  -- masquage (modération) sans suppression
    cree_le     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avis_visibles
    ON avis (masque, cree_le DESC);

-- Avis par défaut (anciennement codés en dur dans la landing), insérés une
-- seule fois pour que tout le monde parte de la même base.
INSERT INTO avis (nom, role, texte, note, est_defaut)
SELECT v.nom, v.role, v.texte, v.note, TRUE
FROM (VALUES
    ('Alex M.', 'Moniteur d''auto-école, 19 ans', 'Je n''achète plus une pièce sans la tester sur mon mannequin d''abord. Économie de temps et d''argent.', 5),
    ('Romain C.', 'Administrateur réseau, 19 ans', 'Le rendu IA est bluffant. J''ai essayé 20 looks en 10 minutes pour préparer ma semaine.', 5),
    ('Mathilde L.', 'Créatrice de contenu, 67 ans', 'Enfin une app qui valorise vraiment ma garde-robe. Le mode 360° est addictif.', 5)
) AS v(nom, role, texte, note)
WHERE NOT EXISTS (SELECT 1 FROM avis WHERE est_defaut = TRUE);
