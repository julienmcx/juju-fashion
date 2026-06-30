const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/upload');
const { authRequired } = require('../middlewares/auth');
const { ensureWebFriendly } = require('../utils/convertHeic');
const path = require('path');

router.post('/', authRequired, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu (champ "image" attendu)' });
  }
  try {
    // Convertit en WebP si HEIC/HEIF (sinon inchangé)
    const finalPath = await ensureWebFriendly(req.file.path);
    const finalFilename = path.basename(finalPath);

    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
    const url = `${baseUrl}/uploads/${finalFilename}`;
    return res.status(201).json({
      url,
      filename: finalFilename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error('upload conversion error:', err);
    return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
  }
});

// Gestion des erreurs Multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fichier trop volumineux (max 10 MB)' });
  }
  return res.status(400).json({ error: err.message });
});

module.exports = router;