const db = require('../db');

async function listCategories(req, res) {
  try {
    const result = await db.query(
      `SELECT id_categorie, nom, type, id_parent
       FROM categories
       ORDER BY type, nom`
    );
    return res.json({ categories: result.rows });
  } catch (err) {
    console.error('listCategories error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listCategories };