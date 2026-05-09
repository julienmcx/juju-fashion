const db = require('../db');

/**
 * POST /api/articles
 * Body attendu :
 * {
 *   id_categorie: 6,
 *   nom: "T-shirt blanc Uniqlo",
 *   image_url: "https://...",
 *   id_marque: 3,                        // optionnel
 *   lien_achat: "https://...",           // optionnel
 *   prix: 19.90,                         // optionnel
 *   devise: "EUR",                       // optionnel, défaut EUR
 *   origine: "neuf",                     // optionnel, défaut "autre"
 *   taille: "M",                         // optionnel
 *   pointure: 42.5,                      // optionnel
 *   longueur_cm: 110,                    // optionnel
 *   matiere_bijou: "argent",             // optionnel
 *   lunettes_teintees: false,            // optionnel
 *   mensurations: { dos: 70 },           // optionnel (JSONB)
 *   notes: "...",                        // optionnel
 *   couleurs: [1, 4],                    // tableau d'id_couleur
 *   matieres: [{id_matiere: 1, pourcentage: 60},
 *              {id_matiere: 2, pourcentage: 40}]
 * }
 */
async function createArticle(req, res) {
  const client = await db.getClient();
  try {
    const {
      id_categorie, nom, image_url,
      id_marque = null, lien_achat = null, prix = null, devise = 'EUR',
      origine = 'autre', taille = null, pointure = null, longueur_cm = null,
      matiere_bijou = null, lunettes_teintees = null,
      mensurations = null, notes = null,
      couleurs = [], matieres = []
    } = req.body;

    // Validation minimale
    if (!id_categorie || !nom || !image_url) {
      return res.status(400).json({
        error: 'Champs requis : id_categorie, nom, image_url'
      });
    }

    await client.query('BEGIN');

    // 1. Insert article principal
    const articleResult = await client.query(
      `INSERT INTO articles (
         id_utilisateur, id_categorie, id_marque,
         nom, image_url, lien_achat, prix, devise, origine,
         taille, pointure, longueur_cm,
         matiere_bijou, lunettes_teintees,
         mensurations, notes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        req.user.id_utilisateur, id_categorie, id_marque,
        nom, image_url, lien_achat, prix, devise, origine,
        taille, pointure, longueur_cm,
        matiere_bijou, lunettes_teintees,
        mensurations, notes
      ]
    );
    const article = articleResult.rows[0];

    // 2. Insert couleurs
    for (const id_couleur of couleurs) {
      await client.query(
        `INSERT INTO articles_couleurs (id_article, id_couleur) VALUES ($1, $2)`,
        [article.id_article, id_couleur]
      );
    }

    // 3. Insert matières
    for (const m of matieres) {
      await client.query(
        `INSERT INTO articles_matieres (id_article, id_matiere, pourcentage)
         VALUES ($1, $2, $3)`,
        [article.id_article, m.id_matiere, m.pourcentage ?? null]
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({ article });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Référence invalide (catégorie, marque, couleur ou matière inexistante)'
      });
    }
    console.error('createArticle error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
}

/**
 * GET /api/articles
 * Query params optionnels :
 *   - id_categorie
 *   - id_marque
 *   - origine
 *   - id_couleur
 *   - search       (recherche textuelle sur nom)
 *   - limit (def 50), offset (def 0)
 */
async function listArticles(req, res) {
  try {
    const {
      id_categorie, id_marque, origine, id_couleur, search,
      limit = 50, offset = 0
    } = req.query;

    const conditions = ['a.id_utilisateur = $1'];
    const values = [req.user.id_utilisateur];

    if (id_categorie) { values.push(id_categorie); conditions.push(`a.id_categorie = $${values.length}`); }
    if (id_marque)    { values.push(id_marque);    conditions.push(`a.id_marque = $${values.length}`); }
    if (origine)      { values.push(origine);      conditions.push(`a.origine = $${values.length}`); }
    if (search)       { values.push(`%${search}%`); conditions.push(`a.nom ILIKE $${values.length}`); }
    if (id_couleur) {
      values.push(id_couleur);
      conditions.push(`EXISTS (
        SELECT 1 FROM articles_couleurs ac
        WHERE ac.id_article = a.id_article AND ac.id_couleur = $${values.length}
      )`);
    }

    values.push(limit, offset);

    const sql = `
      SELECT
        a.id_article, a.nom, a.image_url, a.prix, a.devise,
        a.origine, a.taille, a.cree_le,
        c.nom AS categorie,
        m.nom_marque AS marque,
        COALESCE(
          (SELECT json_agg(json_build_object('id_couleur', co.id_couleur, 'nom', co.nom, 'code_hex', co.code_hex))
           FROM articles_couleurs ac
           JOIN couleurs co ON co.id_couleur = ac.id_couleur
           WHERE ac.id_article = a.id_article),
          '[]'::json
        ) AS couleurs
      FROM articles a
      LEFT JOIN categories c ON c.id_categorie = a.id_categorie
      LEFT JOIN marques m ON m.id_marque = a.id_marque
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.cree_le DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await db.query(sql, values);
    return res.json({ articles: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('listArticles error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { createArticle, listArticles };