const db = require('../db');
const { runTryOn } = require('../services/vton');
const { mapCategoryForVTON, isVTONSupported } = require('../services/categoryMapping');
const DAILY_LIMIT = 2;
const REQUIRED_ANGLES = ['face', 'profil_droit', 'dos', 'profil_gauche'];


async function createTryOn(req, res) {
  const { id_article } = req.body;

  if (!id_article) {
    return res.status(400).json({ error: 'id_article requis' });
  }

  try {
    // 1. Récupère l'article (et vérifie qu'il appartient au user)
    const articleResult = await db.query(
      `SELECT a.id_article, a.nom, a.image_url, a.id_utilisateur,
              c.nom AS categorie_nom, c.type AS categorie_type
       FROM articles a
       LEFT JOIN categories c ON c.id_categorie = a.id_categorie
       WHERE a.id_article = $1 AND a.id_utilisateur = $2`,
      [id_article, req.user.id_utilisateur]
    );

    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }

    const article = articleResult.rows[0];

    if (!article.image_url) {
      return res.status(400).json({ error: 'Cet article n\'a pas d\'image' });
    }

    if (!isVTONSupported(article.categorie_type)) {
      return res.status(400).json({
        error: 'Cette catégorie ne supporte pas l\'essayage virtuel (bijoux, lunettes…)',
      });
    }

    // 2. Vérifie que les 4 photos d'avatar existent
    const photosResult = await db.query(
      `SELECT angle, image_url FROM photos_avatar
       WHERE id_utilisateur = $1 AND angle = ANY($2)`,
      [req.user.id_utilisateur, REQUIRED_ANGLES]
    );

    if (photosResult.rows.length < REQUIRED_ANGLES.length) {
      const present = photosResult.rows.map((p) => p.angle);
      const manquants = REQUIRED_ANGLES.filter((a) => !present.includes(a));
      return res.status(400).json({
        error: 'Mannequin incomplet. Capture toutes les photos d\'angle.',
        angles_manquants: manquants,
      });
    }

    const photosMap = {};
    photosResult.rows.forEach((p) => { photosMap[p.angle] = p.image_url; });

    // 3. Rate-limit : max DAILY_LIMIT essayages par jour
    const todayResult = await db.query(
      `SELECT COUNT(*) FROM essayages_log
       WHERE id_utilisateur = $1 AND cree_le > NOW() - INTERVAL '24 hours'`,
      [req.user.id_utilisateur]
    );
    const usedToday = parseInt(todayResult.rows[0].count, 10);

    if (usedToday >= DAILY_LIMIT) {
      return res.status(429).json({
        error: `Limite quotidienne atteinte (${DAILY_LIMIT} essayages / 24h). Réessaie plus tard.`,
        used: usedToday,
        limit: DAILY_LIMIT,
      });
    }

    // 4. Lancement des 4 inférences EN PARALLÈLE
    const category = mapCategoryForVTON(article.categorie_nom, article.categorie_type);
    const description = `${article.categorie_nom || 'clothing'} ${article.nom || ''}`.trim();

    console.log(`[VTON] User ${req.user.id_utilisateur} essaye article ${id_article} (${description}, ${category})`);

    const inferences = REQUIRED_ANGLES.map(async (angle) => {
      try {
        const resultUrl = await runTryOn({
          humanImageUrl: photosMap[angle],
          garmentImageUrl: article.image_url,
          garmentDescription: description,
          category,
        });
        return { angle, image_url: resultUrl, success: true };
      } catch (err) {
        console.error(`[VTON] Erreur sur angle ${angle}:`, err.message);
        return { angle, success: false, message: err.message };
      }
    });

    const settled = await Promise.all(inferences);
    const results = settled.filter((r) => r.success);
    const errors = settled.filter((r) => !r.success);

    // 5. Log de l'essayage (pour le rate-limit)
    const statut = errors.length === 0 ? 'success' : (results.length === 0 ? 'error' : 'partial');
    await db.query(
      `INSERT INTO essayages_log (id_utilisateur, id_article, statut) VALUES ($1, $2, $3)`,
      [req.user.id_utilisateur, id_article, statut]
    );

    // 6. Si tout a échoué, on renvoie une erreur 502 (problème côté Replicate)
    if (results.length === 0) {
      return res.status(502).json({
        error: 'Tous les angles ont échoué côté service IA.',
        errors,
      });
    }

    return res.json({
      article: {
        id_article: article.id_article,
        nom: article.nom,
        image_url: article.image_url,
        categorie_nom: article.categorie_nom,
      },
      results: results.map((r) => ({ angle: r.angle, image_url: r.image_url })),
      errors: errors.map((e) => ({ angle: e.angle, message: e.message })),
      stats: {
        used_today: usedToday + 1,
        daily_limit: DAILY_LIMIT,
      },
    });
  } catch (err) {
    console.error('[VTON] Erreur générale:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getQuota(req, res) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) FROM essayages_log
       WHERE id_utilisateur = $1 AND cree_le > NOW() - INTERVAL '24 hours'`,
      [req.user.id_utilisateur]
    );
    const used = parseInt(result.rows[0].count, 10);
    return res.json({
      used,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - used),
    });
  } catch (err) {
    console.error('[VTON] getQuota error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { createTryOn, getQuota };