const { removeBackgroundAndStore } = require('../services/vton');

async function removeBackground(req, res) {
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'image_url requis' });
  }

  try {
    const cleanUrl = await removeBackgroundAndStore(image_url);
    return res.json({ url: cleanUrl });
  } catch (err) {
    console.error('[BG-REMOVE] Erreur:', err.message);
    // Fichier source introuvable = faute client (400) ; sinon échec service IA (502).
    const notFound = /introuvable/i.test(err.message || '');
    return res.status(notFound ? 400 : 502).json({
      error: notFound ? 'Image introuvable.' : 'Suppression du fond impossible. Réessaie plus tard.',
    });
  }
}

module.exports = { removeBackground };
