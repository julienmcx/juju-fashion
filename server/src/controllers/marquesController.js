const db = require('../db');

// GET /api/marques  -> uniquement les marques de l'utilisateur connecté
async function listMarques(req, res) {
  try {
    const userId = req.user.id_utilisateur;
    const result = await db.query(
      'SELECT id_marque, nom_marque FROM marques WHERE id_utilisateur = $1 ORDER BY nom_marque ASC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('listMarques:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des marques.' });
  }
}

// POST /api/marques  -> crée une marque POUR l'utilisateur connecté
async function createMarque(req, res) {
  try {
    const userId = req.user.id_utilisateur;
    const nom = (req.body.nom_marque || req.body.nom || '').trim();
    if (!nom) {
      return res.status(400).json({ message: 'Le nom de la marque est requis.' });
    }

    // Anti-doublon pour CE user (insensible à la casse) : renvoie l'existante
    const existing = await db.query(
      'SELECT id_marque, nom_marque FROM marques WHERE id_utilisateur = $1 AND LOWER(nom_marque) = LOWER($2)',
      [userId, nom]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json(existing.rows[0]);
    }

    const result = await db.query(
      'INSERT INTO marques (nom_marque, id_utilisateur) VALUES ($1, $2) RETURNING id_marque, nom_marque',
      [nom, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // doublon (course entre 2 requêtes) -> renvoie l'existante
      const again = await db.query(
        'SELECT id_marque, nom_marque FROM marques WHERE id_utilisateur = $1 AND LOWER(nom_marque) = LOWER($2)',
        [req.user.id_utilisateur, (req.body.nom_marque || req.body.nom || '').trim()]
      );
      if (again.rows.length > 0) return res.status(200).json(again.rows[0]);
    }
    console.error('createMarque:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la marque.' });
  }
}

// DELETE /api/marques/:id  -> supprime une marque de l'utilisateur connecté
// (la FK articles.id_marque est ON DELETE SET NULL : les articles qui
//  utilisaient cette marque ne sont PAS supprimés, ils perdent juste leur marque)
async function deleteMarque(req, res) {
  try {
    const userId = req.user.id_utilisateur;
    const result = await db.query(
      'DELETE FROM marques WHERE id_marque = $1 AND id_utilisateur = $2 RETURNING id_marque',
      [req.params.id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Marque introuvable.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('deleteMarque:', err);
    return res.status(500).json({ message: 'Erreur lors de la suppression de la marque.' });
  }
}

module.exports = { listMarques, createMarque, deleteMarque };