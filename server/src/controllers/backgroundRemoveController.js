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
    return res.status(502).json({
      error: 'Suppression du fond impossible.',
      detail: err.message,
    });
  }
}

module.exports = { removeBackground };
