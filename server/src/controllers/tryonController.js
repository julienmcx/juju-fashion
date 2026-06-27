const db = require('../db');
const { runTryOn } = require('../services/vton');
const { mapCategoryForVTON, isVTONSupported } = require('../services/categoryMapping');

// Quota d'essayages virtuels par utilisateur, sur toute la durée de vie du
// compte (en attendant une formule payante). Les tentatives entièrement
// échouées (statut 'error') ne sont pas décomptées.
const LIFETIME_LIMIT = 2;
const REQUIRED_ANGLES = ['face', 'profil_droit', 'dos', 'profil_gauche'];

async function createTryOn(req, res) {
  const { id_article } = req.body;

  if (!id_article) {
    return res.status(400).json({ error: 'id_article requis' });
  }

  try {
    // 1. Article
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

    // 2. Photos avatar
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

    // 3. Quota à vie
    const usageResult = await db.query(
      `SELECT COUNT(*) FROM essayages_log
       WHERE id_utilisateur = $1 AND statut <> 'error'`,
      [req.user.id_utilisateur]
    );
    const usedTotal = parseInt(usageResult.rows[0].count, 10);

    if (usedTotal >= LIFETIME_LIMIT) {
      return res.status(429).json({
        error: `Tu as utilisé tes ${LIFETIME_LIMIT} essayages gratuits. Une formule pour en profiter davantage arrivera bientôt.`,
        used: usedTotal,
        limit: LIFETIME_LIMIT,
      });
    }

    // 4. Inférences VTON en parallèle
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

    // 5. Insert dans essayages_log avec URLs FASHN éphémères
    const statut = errors.length === 0 ? 'success' : (results.length === 0 ? 'error' : 'partial');

    const urlByAngle = {};
    results.forEach((r) => { urlByAngle[r.angle] = r.image_url; });

    const insertResult = await db.query(
      `INSERT INTO essayages_log (
         id_utilisateur, id_article, statut,
         image_url_face, image_url_profil_droit, image_url_dos, image_url_profil_gauche,
         vetement_image_url, vetement_nom, categorie_nom, saved
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE)
       RETURNING id_essayage`,
      [
        req.user.id_utilisateur, id_article, statut,
        urlByAngle.face || null,
        urlByAngle.profil_droit || null,
        urlByAngle.dos || null,
        urlByAngle.profil_gauche || null,
        article.image_url, article.nom, article.categorie_nom,
      ]
    );
    const idEssayage = insertResult.rows[0].id_essayage;

    if (results.length === 0) {
      return res.status(502).json({ error: 'Tous les angles ont échoué côté service IA.', errors });
    }

    return res.json({
      id_essayage: idEssayage,
      article: {
        id_article: article.id_article,
        nom: article.nom,
        image_url: article.image_url,
        categorie_nom: article.categorie_nom,
      },
      results: results.map((r) => ({ angle: r.angle, image_url: r.image_url })),
      errors: errors.map((e) => ({ angle: e.angle, message: e.message })),
      stats: { used: usedTotal + 1, limit: LIFETIME_LIMIT },
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
       WHERE id_utilisateur = $1 AND statut <> 'error'`,
      [req.user.id_utilisateur]
    );
    const used = parseInt(result.rows[0].count, 10);
    return res.json({
      used, limit: LIFETIME_LIMIT, remaining: Math.max(0, LIFETIME_LIMIT - used),
    });
  } catch (err) {
    console.error('[VTON] getQuota error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { createTryOn, getQuota };