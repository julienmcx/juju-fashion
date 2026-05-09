const db = require('../db');

async function listMatieres(req, res) {
  try {
    const result = await db.query(
      `SELECT id_matiere, nom FROM matieres ORDER BY nom`
    );
    return res.json({ matieres: result.rows });
  } catch (err) {
    console.error('listMatieres error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listMatieres };
