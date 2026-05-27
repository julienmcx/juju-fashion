const db = require('../db');
const { downloadAndStore, removeFile } = require('../services/imageStorage');

const ANGLE_COLUMNS = {
    face: 'image_url_face',
    profil_droit: 'image_url_profil_droit',
    dos: 'image_url_dos',
    profil_gauche: 'image_url_profil_gauche',
};

async function listEssayages(req, res) {
    try {
        const limit = parseInt(req.query.limit, 10) || 50;
        const result = await db.query(
            `SELECT id_essayage, id_article, vetement_nom, vetement_image_url, categorie_nom,
              image_url_face, image_url_profil_droit, image_url_dos, image_url_profil_gauche,
              statut, cree_le
       FROM essayages_log
       WHERE id_utilisateur = $1 AND saved = TRUE
       ORDER BY cree_le DESC
       LIMIT $2`,
            [req.user.id_utilisateur, limit]
        );
        return res.json({ essayages: result.rows, count: result.rows.length });
    } catch (err) {
        console.error('[essayages] list error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function getEssayage(req, res) {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT id_essayage, id_article, vetement_nom, vetement_image_url, categorie_nom,
              image_url_face, image_url_profil_droit, image_url_dos, image_url_profil_gauche,
              statut, saved, cree_le
       FROM essayages_log
       WHERE id_essayage = $1 AND id_utilisateur = $2`,
            [id, req.user.id_utilisateur]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Essayage introuvable' });
        }
        return res.json({ essayage: result.rows[0] });
    } catch (err) {
        console.error('[essayages] get error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function saveEssayage(req, res) {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT * FROM essayages_log
       WHERE id_essayage = $1 AND id_utilisateur = $2`,
            [id, req.user.id_utilisateur]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Essayage introuvable' });
        }
        const essayage = result.rows[0];

        if (essayage.saved) {
            return res.json({ essayage, already_saved: true });
        }

        const updatedUrls = {};
        for (const [angle, col] of Object.entries(ANGLE_COLUMNS)) {
            const url = essayage[col];
            if (!url) continue;
            if (url.startsWith('/uploads/')) {
                updatedUrls[col] = url;
                continue;
            }
            try {
                const localPath = await downloadAndStore(url, angle);
                updatedUrls[col] = localPath;
            } catch (err) {
                console.error(`[essayages] télécharge angle ${angle} :`, err.message);
                updatedUrls[col] = null;
            }
        }

        const updateResult = await db.query(
            `UPDATE essayages_log SET
         image_url_face = $1,
         image_url_profil_droit = $2,
         image_url_dos = $3,
         image_url_profil_gauche = $4,
         saved = TRUE
       WHERE id_essayage = $5
       RETURNING *`,
            [
                updatedUrls.image_url_face,
                updatedUrls.image_url_profil_droit,
                updatedUrls.image_url_dos,
                updatedUrls.image_url_profil_gauche,
                id,
            ]
        );

        return res.json({ essayage: updateResult.rows[0], saved: true });
    } catch (err) {
        console.error('[essayages] save error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function deleteEssayage(req, res) {
    try {
        const { id } = req.params;
        const result = await db.query(
            `DELETE FROM essayages_log
       WHERE id_essayage = $1 AND id_utilisateur = $2
       RETURNING image_url_face, image_url_profil_droit, image_url_dos, image_url_profil_gauche`,
            [id, req.user.id_utilisateur]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Essayage introuvable' });
        }
        const row = result.rows[0];
        await Promise.all([
            removeFile(row.image_url_face),
            removeFile(row.image_url_profil_droit),
            removeFile(row.image_url_dos),
            removeFile(row.image_url_profil_gauche),
        ]);
        return res.json({ deleted: true });
    } catch (err) {
        console.error('[essayages] delete error:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

module.exports = { listEssayages, getEssayage, saveEssayage, deleteEssayage };