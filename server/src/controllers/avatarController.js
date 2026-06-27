const db = require('../db');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../middlewares/upload');
const { ensureWebFriendly } = require('../utils/convertHeic');
const VALID_ANGLES = ['face', 'dos', 'profil_gauche', 'profil_droit'];

async function listPhotos(req, res) {
  try {
    const result = await db.query(
      `SELECT id_photo, angle, image_url, cree_le
       FROM photos_avatar
       WHERE id_utilisateur = $1
       ORDER BY angle`,
      [req.user.id_utilisateur]
    );
    return res.json({
      photos: result.rows,
      angles_attendus: VALID_ANGLES,
      total: result.rows.length,
    });
  } catch (err) {
    console.error('listPhotos error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function uploadPhoto(req, res) {
  try {
    const { angle } = req.body;
    if (!angle || !VALID_ANGLES.includes(angle)) {
      if (req.file) fs.unlink(req.file.path, () => { });
      return res.status(400).json({
        error: `Angle invalide. Valeurs acceptées : ${VALID_ANGLES.join(', ')}`,
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    // Convertit en WebP si le fichier est un HEIC/HEIF (sinon inchangé)
    const finalPath = await ensureWebFriendly(req.file.path);
    const finalFilename = path.basename(finalPath);

    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
    const image_url = `${baseUrl}/uploads/${finalFilename}`;
    const existing = await db.query(
      `SELECT image_url FROM photos_avatar
       WHERE id_utilisateur = $1 AND angle = $2`,
      [req.user.id_utilisateur, angle]
    );
    const result = await db.query(
      `INSERT INTO photos_avatar (id_utilisateur, angle, image_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_utilisateur, angle)
       DO UPDATE SET image_url = EXCLUDED.image_url, cree_le = NOW()
       RETURNING *`,
      [req.user.id_utilisateur, angle, image_url]
    );
    // Nettoyer l'ancien fichier sur le disque
    if (existing.rows.length > 0) {
      const oldFilename = path.basename(existing.rows[0].image_url);
      fs.unlink(path.join(UPLOAD_DIR, oldFilename), () => { });
    }
    return res.status(201).json({ photo: result.rows[0] });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => { });
    console.error('uploadPhoto error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function deletePhoto(req, res) {
  try {
    const { angle } = req.params;
    if (!VALID_ANGLES.includes(angle)) {
      return res.status(400).json({ error: 'Angle invalide' });
    }
    const result = await db.query(
      `DELETE FROM photos_avatar
       WHERE id_utilisateur = $1 AND angle = $2
       RETURNING image_url`,
      [req.user.id_utilisateur, angle]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo introuvable pour cet angle' });
    }
    // Nettoyer le fichier sur le disque
    const filename = path.basename(result.rows[0].image_url);
    fs.unlink(path.join(UPLOAD_DIR, filename), () => { });
    return res.status(204).send();
  } catch (err) {
    console.error('deletePhoto error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listPhotos, uploadPhoto, deletePhoto, VALID_ANGLES };