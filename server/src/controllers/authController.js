const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function register(req, res) {
  try {
    const { email, mot_de_passe, nom } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Normalisation email : trim + lowercase (un espace en début/fin ne doit pas passer)
    const emailNorm = email.trim().toLowerCase();

    if (!isValidEmail(emailNorm)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }
    if (mot_de_passe.trim().length === 0) {
      return res.status(400).json({ error: 'Le mot de passe ne peut pas contenir uniquement des espaces' });
    }
    if (mot_de_passe.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères' });
    }

    // Normalisation du nom : espaces uniquement -> null, et respect de la limite VARCHAR(100)
    let nomClean = null;
    if (typeof nom === 'string') {
      const nomTrim = nom.trim();
      if (nomTrim.length === 0) {
        nomClean = null;
      } else if (nomTrim.length > 100) {
        console.warn(`[Register] nom trop long (${nomTrim.length} caractères), tronqué à 100`);
        nomClean = nomTrim.slice(0, 100);
      } else {
        nomClean = nomTrim;
      }
    }

    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO utilisateurs (email, mot_de_passe_hash, nom)
       VALUES ($1, $2, $3)
       RETURNING id_utilisateur, email, nom, cree_le`,
      [emailNorm, hash, nomClean]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id_utilisateur: user.id_utilisateur, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({ user, token });
  } catch (err) {
    // Code Postgres 23505 = violation de contrainte UNIQUE (email déjà pris)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    // Log détaillé pour diagnostiquer les 500 (mot de passe masqué)
    const safeBody = { ...req.body };
    if (safeBody.mot_de_passe !== undefined) safeBody.mot_de_passe = '***';
    console.error('[Register] Échec inscription:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      constraint: err.constraint,
      body: safeBody,
    });
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function login(req, res) {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const result = await db.query(
      `SELECT id_utilisateur, email, mot_de_passe_hash, nom
       FROM utilisateurs
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id_utilisateur: user.id_utilisateur, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      user: {
        id_utilisateur: user.id_utilisateur,
        email: user.email,
        nom: user.nom
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function me(req, res) {
  try {
    const result = await db.query(
      `SELECT id_utilisateur, email, nom, avatar_url, mensurations, cree_le
       FROM utilisateurs
       WHERE id_utilisateur = $1`,
      [req.user.id_utilisateur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateProfile(req, res) {
  try {
    const { nom } = req.body;

    if (typeof nom !== 'string' || nom.trim().length === 0) {
      return res.status(400).json({ error: 'Le pseudo ne peut pas être vide' });
    }
    const nomClean = nom.trim();
    if (nomClean.length > 100) {
      return res.status(400).json({ error: 'Le pseudo ne peut pas dépasser 100 caractères' });
    }

    const result = await db.query(
      `UPDATE utilisateurs
       SET nom = $1, modifie_le = NOW()
       WHERE id_utilisateur = $2
       RETURNING id_utilisateur, email, nom, avatar_url, mensurations, cree_le`,
      [nomClean, req.user.id_utilisateur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[updateProfile] error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { register, login, me, updateProfile };