const db = require('../db');

// Clé d'administration pour masquer un avis (modération). Réglable via l'env ;
// valeur par défaut alignée sur le mode admin historique de la landing.
const ADMIN_KEY = process.env.ADMIN_REVIEW_KEY || 'juju2026';

// Liste tous les avis visibles (les plus récents d'abord, avis par défaut à la fin).
async function listAvis(req, res) {
    try {
        const result = await db.query(
            `SELECT id_avis, nom, role, texte, note, est_defaut, cree_le
       FROM avis
       WHERE masque = FALSE
       ORDER BY est_defaut ASC, cree_le DESC`
        );
        return res.json({ avis: result.rows });
    } catch (err) {
        console.error('[avis] list error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

// Publie un nouvel avis (public, sans authentification).
async function createAvis(req, res) {
    try {
        let { nom, role, texte, note } = req.body;

        nom = typeof nom === 'string' ? nom.trim() : '';
        texte = typeof texte === 'string' ? texte.trim() : '';
        role = typeof role === 'string' ? role.trim() : '';
        note = parseInt(note, 10);

        if (!nom || !texte || !Number.isInteger(note) || note < 1 || note > 5) {
            return res.status(400).json({
                error: 'Prénom, note (entre 1 et 5) et avis sont requis.',
            });
        }

        // Bornes de longueur (cohérentes avec le formulaire de la landing).
        nom = nom.slice(0, 40);
        texte = texte.slice(0, 280);
        role = role ? role.slice(0, 80) : null;

        const result = await db.query(
            `INSERT INTO avis (nom, role, texte, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id_avis, nom, role, texte, note, est_defaut, cree_le`,
            [nom, role, texte, note]
        );
        return res.status(201).json({ avis: result.rows[0] });
    } catch (err) {
        console.error('[avis] create error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

// Masque un avis (modération). Protégé par la clé admin.
async function deleteAvis(req, res) {
    try {
        const key = req.get('X-Admin-Key') || req.query.key;
        if (key !== ADMIN_KEY) {
            return res.status(401).json({ error: 'Non autorisé' });
        }
        const result = await db.query(
            `UPDATE avis SET masque = TRUE WHERE id_avis = $1`,
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Avis introuvable' });
        }
        return res.status(204).send();
    } catch (err) {
        console.error('[avis] delete error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

module.exports = { listAvis, createAvis, deleteAvis };
