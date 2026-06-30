const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/upload');
const { webpConvert } = require('../services/imageProcessing');
const { authRequired } = require('../middlewares/auth');

router.post('/', authRequired, upload.single('image'), webpConvert, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu (champ "image" attendu)' });
  }

  const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  return res.status(201).json({
    url,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Gestion des erreurs Multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fichier trop volumineux (max 10 MB)' });
  }
  return res.status(400).json({ error: err.message });
});

module.exports = router;