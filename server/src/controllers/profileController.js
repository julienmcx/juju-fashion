const db = require('../db');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../middlewares/upload');

async function getStats(req, res) {
  const userId = req.user.id_utilisateur;
  try {
    const photosResult = await db.query(
      `SELECT angle FROM photos_avatar
       WHERE id_utilisateur = $1 AND angle = ANY($2)`,
      [userId, ['face', 'profil_droit', 'dos', 'profil_gauche']]
    );
    const avatarComplet = photosResult.rows.length === 4;

    const userResult = await db.query(
      `SELECT avatar_url FROM utilisateurs WHERE id_utilisateur = $1`,
      [userId]
    );
    const avatarUrl = userResult.rows[0]?.avatar_url || null;

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

    // Quota d'essayages à vie (aligné sur tryonController.LIFETIME_LIMIT).
    const ESSAYAGE_LIFETIME_LIMIT = 2;
    const essayagesResult = await db.query(
      `SELECT COUNT(*) FILTER (WHERE statut <> 'error')::int AS used
       FROM essayages_log WHERE id_utilisateur = $1`,
      [userId]
    );

    const favorisResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM articles WHERE id_utilisateur = $1 AND favori = TRUE`,
      [userId]
    );

    const marqueTopResult = await db.query(
      `SELECT m.nom_marque AS nom, COUNT(*)::int AS count
       FROM articles a
       JOIN marques m ON m.id_marque = a.id_marque
       WHERE a.id_utilisateur = $1
       GROUP BY m.nom_marque
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    const couleurTopResult = await db.query(
      `SELECT co.nom, co.code_hex, COUNT(*)::int AS count
       FROM articles_couleurs ac
       JOIN articles a ON a.id_article = ac.id_article
       JOIN couleurs co ON co.id_couleur = ac.id_couleur
       WHERE a.id_utilisateur = $1
       GROUP BY co.nom, co.code_hex
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    const articleEssayeResult = await db.query(
      `SELECT a.id_article, a.nom, a.image_url, COUNT(*)::int AS count
       FROM essayages_log e
       JOIN articles a ON a.id_article = e.id_article
       WHERE e.id_utilisateur = $1
       GROUP BY a.id_article, a.nom, a.image_url
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    const articles = articlesResult.rows[0];
    const essayages = essayagesResult.rows[0];

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
        total: essayages.used,
        limit: ESSAYAGE_LIFETIME_LIMIT,
        remaining: Math.max(0, ESSAYAGE_LIFETIME_LIMIT - essayages.used),
      },
      insights: {
        favoris_count: favorisResult.rows[0]?.count || 0,
        marque_top: marqueTopResult.rows[0] || null,
        couleur_top: couleurTopResult.rows[0] || null,
        article_plus_essaye: articleEssayeResult.rows[0] || null,
        prix_moyen: articles.total > 0
          ? Math.round(parseFloat(articles.valeur_totale) / articles.total)
          : 0,
      },
    });
  } catch (err) {
    console.error('[PROFILE] getStats error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateAvatar(req, res) {
  const userId = req.user.id_utilisateur;
  const { avatar_url } = req.body;

  if (avatar_url !== null && (!avatar_url || typeof avatar_url !== 'string')) {
    return res.status(400).json({ error: 'avatar_url requis (ou null pour retirer)' });
  }

  try {
    const old = await db.query(
      `SELECT avatar_url FROM utilisateurs WHERE id_utilisateur = $1`,
      [userId]
    );
    const oldUrl = old.rows[0]?.avatar_url;

    await db.query(
      `UPDATE utilisateurs SET avatar_url = $1 WHERE id_utilisateur = $2`,
      [avatar_url, userId]
    );

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