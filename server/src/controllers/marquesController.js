const db = require('../db');

async function listMarques(req, res) {
  try {
    const result = await db.query(
      `SELECT id_marque, nom_marque FROM marques ORDER BY nom_marque`
    );
    return res.json({ marques: result.rows });
  } catch (err) {
    console.error('listMarques error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function createMarque(req, res) {
  try {
    const { nom_marque } = req.body;
    if (!nom_marque || nom_marque.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom de la marque est requis' });
    }

    const trimmed = nom_marque.trim();

    const existing = await db.query(
      `SELECT id_marque, nom_marque FROM marques WHERE LOWER(nom_marque) = LOWER($1)`,
      [trimmed]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json({ marque: existing.rows[0], created: false });
    }

    const inserted = await db.query(
      `INSERT INTO marques (nom_marque) VALUES ($1) RETURNING id_marque, nom_marque`,
      [trimmed]
    );
    return res.status(201).json({ marque: inserted.rows[0], created: true });
  } catch (err) {
    console.error('createMarque error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listMarques, createMarque };