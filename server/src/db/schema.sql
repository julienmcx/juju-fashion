-- =====================================================================
-- JUJU - Garde-robe virtuelle
-- Schéma PostgreSQL (MPD)
-- =====================================================================
-- Convention :
--   - snake_case partout
--   - timestamps en TIMESTAMPTZ (avec fuseau)
--   - mots de passe stockés en HASH uniquement (bcrypt / argon2)
--   - ON DELETE CASCADE pour le contenu propriétaire de l'utilisateur
--   - ON DELETE RESTRICT pour les référentiels partagés (catégories,
--     couleurs, matières) afin d'éviter les suppressions accidentelles
-- =====================================================================

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. TYPES ÉNUMÉRÉS
-- =====================================================================

CREATE TYPE origine_article AS ENUM (
    'neuf',
    'fripe',
    'seconde_main',
    'cadeau',
    'fait_main',
    'autre'
);

CREATE TYPE type_categorie AS ENUM (
    'vetement',
    'accessoire',
    'chaussure',
    'bijou',
    'lunettes'
);

-- =====================================================================
-- 2. UTILISATEURS
-- =====================================================================

CREATE TABLE utilisateurs (
    id_utilisateur     SERIAL PRIMARY KEY,
    email              VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash  VARCHAR(255) NOT NULL,
    nom                VARCHAR(100),
    avatar_url         TEXT,        -- URL de l'avatar 360° généré
    mensurations       JSONB,       -- ex: {"tour_poitrine": 92, "tour_taille": 76, ...}
    cree_le            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modifie_le         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Les 8 photos sources servant à générer l'avatar 360°
CREATE TABLE photos_avatar (
    id_photo        SERIAL PRIMARY KEY,
    id_utilisateur  INT NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    angle           VARCHAR(30) NOT NULL,   -- 'face', 'dos', 'profil_gauche', 'profil_droit', '3/4_avant_gauche', etc.
    image_url       TEXT NOT NULL,
    cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_utilisateur, angle)          -- un seul cliché par angle par utilisateur
);

-- =====================================================================
-- 3. RÉFÉRENTIELS PARTAGÉS
-- =====================================================================

CREATE TABLE marques (
    id_marque   SERIAL PRIMARY KEY,
    nom_marque  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE categories (
    id_categorie  SERIAL PRIMARY KEY,
    nom           VARCHAR(50) NOT NULL UNIQUE,    -- 'Haut', 'T-shirt', 'Pantalon', 'Ceinture'...
    type          type_categorie NOT NULL,
    id_parent     INT REFERENCES categories(id_categorie) ON DELETE SET NULL
);

CREATE TABLE couleurs (
    id_couleur  SERIAL PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL UNIQUE,      -- 'Bleu marine', 'Bordeaux'...
    code_hex    CHAR(7)                            -- '#1A2B3C' pour l'affichage UI
);

CREATE TABLE matieres (
    id_matiere  SERIAL PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL UNIQUE       -- 'Coton', 'Polyester', 'Laine'...
);

-- =====================================================================
-- 4. ARTICLES
-- =====================================================================

CREATE TABLE articles (
    id_article      SERIAL PRIMARY KEY,
    id_utilisateur  INT NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_marque       INT REFERENCES marques(id_marque) ON DELETE SET NULL,
    id_categorie    INT NOT NULL REFERENCES categories(id_categorie) ON DELETE RESTRICT,

    nom             VARCHAR(150) NOT NULL,
    image_url       TEXT NOT NULL,
    lien_achat      TEXT,
    prix            NUMERIC(10, 2),
    devise          CHAR(3) DEFAULT 'EUR',
    origine         origine_article NOT NULL DEFAULT 'autre',

    -- Taille : sémantique variable selon la catégorie
    taille          VARCHAR(20),         -- 'M', '38', 'L/XL'
    pointure        NUMERIC(4, 1),       -- 41, 39.5 (chaussures, chaussettes)
    longueur_cm     NUMERIC(6, 2),       -- ceintures, écharpes...

    -- Spécificités accessoires
    matiere_bijou       VARCHAR(50),     -- 'or', 'argent', 'plaqué or'
    lunettes_teintees   BOOLEAN,

    -- Données libres / VTON
    mensurations    JSONB,               -- mesures de l'article si utiles (longueur dos, largeur épaules...)
    notes           TEXT,

    -- Ordre personnalisé dans la garde-robe (drag & drop)
    position        INT,

    cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modifie_le      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 5. ASSOCIATIONS N-N (couleurs, matières)
-- =====================================================================

-- Un article peut avoir plusieurs couleurs (rayures, motifs...)
CREATE TABLE articles_couleurs (
    id_article  INT NOT NULL REFERENCES articles(id_article) ON DELETE CASCADE,
    id_couleur  INT NOT NULL REFERENCES couleurs(id_couleur) ON DELETE RESTRICT,
    PRIMARY KEY (id_article, id_couleur)
);

-- Composition matières avec pourcentage (60% coton, 40% polyester)
CREATE TABLE articles_matieres (
    id_article   INT NOT NULL REFERENCES articles(id_article) ON DELETE CASCADE,
    id_matiere   INT NOT NULL REFERENCES matieres(id_matiere) ON DELETE RESTRICT,
    pourcentage  NUMERIC(5, 2),       -- nullable si inconnu
    PRIMARY KEY (id_article, id_matiere),
    CHECK (pourcentage IS NULL OR (pourcentage > 0 AND pourcentage <= 100))
);

-- =====================================================================
-- 5 bis. AVIS (témoignages landing, partagés entre tous les visiteurs)
-- =====================================================================

CREATE TABLE avis (
    id_avis     SERIAL PRIMARY KEY,
    nom         VARCHAR(40) NOT NULL,
    role        VARCHAR(80),
    texte       VARCHAR(280) NOT NULL,
    note        SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    est_defaut  BOOLEAN NOT NULL DEFAULT FALSE,
    masque      BOOLEAN NOT NULL DEFAULT FALSE,
    cree_le     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avis_visibles ON avis (masque, cree_le DESC);

-- =====================================================================
-- 6. INDEX pour les filtres
-- =====================================================================

CREATE INDEX idx_articles_utilisateur ON articles(id_utilisateur);
CREATE INDEX idx_articles_categorie   ON articles(id_categorie);
CREATE INDEX idx_articles_marque      ON articles(id_marque);
CREATE INDEX idx_articles_origine     ON articles(origine);
CREATE INDEX idx_articles_position    ON articles(id_utilisateur, position);

-- =====================================================================
-- 7. TRIGGER : maintien automatique de modifie_le
-- =====================================================================

CREATE OR REPLACE FUNCTION set_modifie_le()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modifie_le = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_articles_modifie_le
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION set_modifie_le();

CREATE TRIGGER trg_utilisateurs_modifie_le
    BEFORE UPDATE ON utilisateurs
    FOR EACH ROW EXECUTE FUNCTION set_modifie_le();

-- =====================================================================
-- 8. SEED : valeurs de base pour démarrer
-- =====================================================================

-- Catégories vêtement
INSERT INTO categories (nom, type) VALUES
    ('Haut',        'vetement'),
    ('Bas',         'vetement'),
    ('Robe',        'vetement'),
    ('Manteau',     'vetement'),
    ('Sous-vêtement','vetement');

-- Sous-catégories vêtement (exemples)
INSERT INTO categories (nom, type, id_parent) VALUES
    ('T-shirt',     'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Haut')),
    ('Chemise',     'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Haut')),
    ('Pull',        'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Haut')),
    ('Pantalon',    'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Bas')),
    ('Jean',        'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Bas')),
    ('Short',       'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Bas')),
    ('Jupe',        'vetement', (SELECT id_categorie FROM categories WHERE nom = 'Bas'));

-- Accessoires / chaussures / bijoux / lunettes
INSERT INTO categories (nom, type) VALUES
    ('Ceinture',    'accessoire'),
    ('Sac',         'accessoire'),
    ('Écharpe',     'accessoire'),
    ('Chapeau',     'accessoire'),
    ('Chaussure',   'chaussure'),
    ('Chaussette',  'chaussure'),
    ('Bague',       'bijou'),
    ('Collier',     'bijou'),
    ('Bracelet',    'bijou'),
    ('Lunettes',    'lunettes');

-- Couleurs de base
INSERT INTO couleurs (nom, code_hex) VALUES
    ('Noir',        '#000000'),
    ('Blanc',       '#FFFFFF'),
    ('Gris',        '#808080'),
    ('Bleu',        '#1F4E8C'),
    ('Bleu marine', '#0B1F44'),
    ('Rouge',       '#B22222'),
    ('Vert',        '#2E7D32'),
    ('Jaune',       '#F1C40F'),
    ('Beige',       '#D2B48C'),
    ('Marron',      '#5D4037'),
    ('Doré',        '#D4AF37'),
    ('Violet',      '#5E2D91');

-- Matières courantes
INSERT INTO matieres (nom) VALUES
    ('Coton'),
    ('Polyester'),
    ('Laine'),
    ('Lin'),
    ('Soie'),
    ('Cuir'),
    ('Cuir synthétique'),
    ('Denim'),
    ('Viscose'),
    ('Élasthanne'),
    ('Cachemire'),
    ('Nylon');

-- Avis « bêta » par défaut affichés sur la landing
INSERT INTO avis (nom, role, texte, note, est_defaut) VALUES
    ('Alex M.', 'Moniteur d''auto-école, 19 ans', 'Je n''achète plus une pièce sans la tester sur mon mannequin d''abord. Économie de temps et d''argent.', 5, TRUE),
    ('Romain C.', 'Administrateur réseau, 19 ans', 'Le rendu IA est bluffant. J''ai essayé 20 looks en 10 minutes pour préparer ma semaine.', 5, TRUE),
    ('Mathilde L.', 'Créatrice de contenu, 67 ans', 'Enfin une app qui valorise vraiment ma garde-robe. Le mode 360° est addictif.', 5, TRUE);
