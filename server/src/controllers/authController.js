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
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }
    if (mot_de_passe.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères' });
    }

    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO utilisateurs (email, mot_de_passe_hash, nom)
       VALUES ($1, $2, $3)
       RETURNING id_utilisateur, email, nom, cree_le`,
      [email.toLowerCase(), hash, nom || null]
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
    console.error('Register error:', err);
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

module.exports = { register, login, me };