const db = require('../db');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../middlewares/upload');
const { getPremiumState } = require('../services/premium');

async function getStats(req, res) {
  const userId = req.user.id_utilisateur;
  try {
    // Photos avatar (pour savoir si mannequin complet)
    const photosResult = await db.query(
      `SELECT angle FROM photos_avatar
       WHERE id_utilisateur = $1 AND angle = ANY($2)`,
      [userId, ['face', 'profil_droit', 'dos', 'profil_gauche']]
    );
    const avatarComplet = photosResult.rows.length === 4;

    // User : récupère l'avatar_url custom (s'il existe)
    const userResult = await db.query(
      `SELECT avatar_url FROM utilisateurs WHERE id_utilisateur = $1`,
      [userId]
    );
    const avatarUrl = userResult.rows[0]?.avatar_url || null;

    // Articles : compte + somme + répartition
    const articlesResult = await db.query(
      `SELECT
         COUNT(*)::int AS total,
         COALESCE(SUM(prix), 0)::numeric AS valeur_totale
       FROM articles WHERE id_utilisateur = $1`,
      [userId]
    );

    const parCategorieResult = await db.query(
      `SELECT c.nom AS categorie, c.type AS type, COUNT(*)::int AS count
       FROM articles a
       LEFT JOIN categories c ON c.id_categorie = a.id_categorie
       WHERE a.id_utilisateur = $1
       GROUP BY c.nom, c.type
       ORDER BY count DESC, c.nom`,
      [userId]
    );

    // Essayages
    const essayagesResult = await db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE cree_le > NOW() - INTERVAL '24 hours')::int AS today
       FROM essayages_log WHERE id_utilisateur = $1`,
      [userId]
    );

    const articles = articlesResult.rows[0];
    const essayages = essayagesResult.rows[0];
    const premium = await getPremiumState(userId);

    return res.json({
      avatar: {
        custom_url: avatarUrl,
        complet: avatarComplet,
      },
      articles: {
        total: articles.total,
        valeur_totale: parseFloat(articles.valeur_totale),
        par_categorie: parCategorieResult.rows,
      },
      essayages: {
        total: essayages.total,
        today: essayages.today,
        daily_limit: premium.is_premium ? null : 2,
        unlimited: premium.is_premium,
      },
      premium: {
        is_premium: premium.is_premium,
        premium_until: premium.premium_until,
      },
    });
  } catch (err) {
    console.error('[PROFILE] getStats error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/profile/avatar
 * Body: { avatar_url } (URL d'une image déjà uploadée via /api/upload)
 */
async function updateAvatar(req, res) {
  const userId = req.user.id_utilisateur;
  const { avatar_url } = req.body;

  if (avatar_url !== null && (!avatar_url || typeof avatar_url !== 'string')) {
    return res.status(400).json({ error: 'avatar_url requis (ou null pour retirer)' });
  }

  try {
    // Récupère l'ancienne URL pour nettoyer le fichier
    const old = await db.query(
      `SELECT avatar_url FROM utilisateurs WHERE id_utilisateur = $1`,
      [userId]
    );
    const oldUrl = old.rows[0]?.avatar_url;

    // Update
    await db.query(
      `UPDATE utilisateurs SET avatar_url = $1 WHERE id_utilisateur = $2`,
      [avatar_url, userId]
    );

    // Nettoyage de l'ancien fichier (best-effort, on ignore les erreurs)
    if (oldUrl && oldUrl !== avatar_url) {
      try {
        const filename = path.basename(oldUrl);
        fs.unlink(path.join(UPLOAD_DIR, filename), () => {});
      } catch {}
    }

    return res.json({ avatar_url });
  } catch (err) {
    console.error('[PROFILE] updateAvatar error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getStats, updateAvatar };
