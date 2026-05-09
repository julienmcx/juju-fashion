const db = require('../db');

async function listCouleurs(req, res) {
  try {
    const result = await db.query(
      `SELECT id_couleur, nom, code_hex FROM couleurs ORDER BY nom`
    );
    return res.json({ couleurs: result.rows });
  } catch (err) {
    console.error('listCouleurs error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listCouleurs };
