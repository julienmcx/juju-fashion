const db = require('../db');

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

    if (!id_categorie || !nom || !image_url) {
      return res.status(400).json({
        error: 'Champs requis : id_categorie, nom, image_url'
      });
    }

    await client.query('BEGIN');

    // Sécurité : la marque fournie doit appartenir à l'utilisateur connecté
    if (id_marque) {
      const owns = await client.query(
        'SELECT 1 FROM marques WHERE id_marque = $1 AND id_utilisateur = $2',
        [id_marque, req.user.id_utilisateur]
      );
      if (owns.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Marque invalide' });
      }
    }

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

    for (const id_couleur of couleurs) {
      await client.query(
        `INSERT INTO articles_couleurs (id_article, id_couleur) VALUES ($1, $2)`,
        [article.id_article, id_couleur]
      );
    }

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

async function listArticles(req, res) {
  try {
    const {
      id_categorie, id_marque, origine, id_couleur, search, favori,
      limit = 50, offset = 0
    } = req.query;

    const conditions = ['a.id_utilisateur = $1'];
    const values = [req.user.id_utilisateur];

    if (id_categorie) { values.push(id_categorie); conditions.push(`a.id_categorie = $${values.length}`); }
    if (id_marque) { values.push(id_marque); conditions.push(`a.id_marque = $${values.length}`); }
    if (origine) { values.push(origine); conditions.push(`a.origine = $${values.length}`); }
    if (search) { values.push(`%${search}%`); conditions.push(`a.nom ILIKE $${values.length}`); }
    if (favori === 'true') { conditions.push(`a.favori = TRUE`); }
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
        a.origine, a.taille, a.favori, a.cree_le,
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

async function getArticle(req, res) {
  try {
    const sql = `
      SELECT
        a.*,
        c.nom AS categorie_nom,
        c.type AS categorie_type,
        m.nom_marque AS marque_nom,
        COALESCE(
          (SELECT json_agg(json_build_object(
             'id_couleur', co.id_couleur, 'nom', co.nom, 'code_hex', co.code_hex))
           FROM articles_couleurs ac
           JOIN couleurs co ON co.id_couleur = ac.id_couleur
           WHERE ac.id_article = a.id_article),
          '[]'::json
        ) AS couleurs,
        COALESCE(
          (SELECT json_agg(json_build_object(
             'id_matiere', mt.id_matiere, 'nom', mt.nom, 'pourcentage', am.pourcentage))
           FROM articles_matieres am
           JOIN matieres mt ON mt.id_matiere = am.id_matiere
           WHERE am.id_article = a.id_article),
          '[]'::json
        ) AS matieres
      FROM articles a
      LEFT JOIN categories c ON c.id_categorie = a.id_categorie
      LEFT JOIN marques m ON m.id_marque = a.id_marque
      WHERE a.id_article = $1 AND a.id_utilisateur = $2
    `;
    const result = await db.query(sql, [req.params.id, req.user.id_utilisateur]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }
    return res.json({ article: result.rows[0] });
  } catch (err) {
    console.error('getArticle error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateArticle(req, res) {
  const client = await db.getClient();
  try {
    const updatableFields = [
      'id_categorie', 'id_marque', 'nom', 'image_url', 'lien_achat',
      'prix', 'devise', 'origine', 'taille', 'pointure', 'longueur_cm',
      'matiere_bijou', 'lunettes_teintees', 'mensurations', 'notes'
    ];

    const sets = [];
    const values = [];
    let i = 1;

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        sets.push(`${field} = $${i}`);
        values.push(req.body[field]);
        i++;
      }
    }

    await client.query('BEGIN');

    // Sécurité : si on change la marque, elle doit appartenir à l'utilisateur
    if (req.body.id_marque) {
      const owns = await client.query(
        'SELECT 1 FROM marques WHERE id_marque = $1 AND id_utilisateur = $2',
        [req.body.id_marque, req.user.id_utilisateur]
      );
      if (owns.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Marque invalide' });
      }
    }

    let article;
    if (sets.length > 0) {
      values.push(req.params.id, req.user.id_utilisateur);
      const sql = `
        UPDATE articles
        SET ${sets.join(', ')}
        WHERE id_article = $${i} AND id_utilisateur = $${i + 1}
        RETURNING *
      `;
      const result = await client.query(sql, values);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Article introuvable' });
      }
      article = result.rows[0];
    } else {
      const check = await client.query(
        `SELECT * FROM articles WHERE id_article = $1 AND id_utilisateur = $2`,
        [req.params.id, req.user.id_utilisateur]
      );
      if (check.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Article introuvable' });
      }
      article = check.rows[0];
    }

    if (Array.isArray(req.body.couleurs)) {
      await client.query(
        `DELETE FROM articles_couleurs WHERE id_article = $1`,
        [article.id_article]
      );
      for (const id_couleur of req.body.couleurs) {
        await client.query(
          `INSERT INTO articles_couleurs (id_article, id_couleur) VALUES ($1, $2)`,
          [article.id_article, id_couleur]
        );
      }
    }

    if (Array.isArray(req.body.matieres)) {
      await client.query(
        `DELETE FROM articles_matieres WHERE id_article = $1`,
        [article.id_article]
      );
      for (const m of req.body.matieres) {
        await client.query(
          `INSERT INTO articles_matieres (id_article, id_matiere, pourcentage)
           VALUES ($1, $2, $3)`,
          [article.id_article, m.id_matiere, m.pourcentage ?? null]
        );
      }
    }

    await client.query('COMMIT');
    return res.json({ article });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Référence invalide (catégorie, marque, couleur ou matière inexistante)'
      });
    }
    console.error('updateArticle error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
}

async function deleteArticle(req, res) {
  try {
    const result = await db.query(
      `DELETE FROM articles WHERE id_article = $1 AND id_utilisateur = $2`,
      [req.params.id, req.user.id_utilisateur]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('deleteArticle error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function toggleFavori(req, res) {
  try {
    const result = await db.query(
      `UPDATE articles
       SET favori = NOT favori
       WHERE id_article = $1 AND id_utilisateur = $2
       RETURNING id_article, favori`,
      [req.params.id, req.user.id_utilisateur]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }
    return res.json({ id_article: result.rows[0].id_article, favori: result.rows[0].favori });
  } catch (err) {
    console.error('toggleFavori error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { createArticle, listArticles, getArticle, updateArticle, deleteArticle, toggleFavori };