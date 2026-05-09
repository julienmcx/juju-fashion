const express = require('express');
const router = express.Router();
const { createArticle, listArticles } = require('../controllers/articlesController');
const { authRequired } = require('../middlewares/auth');

// Toutes les routes articles nécessitent une authentification
router.use(authRequired);

router.post('/', createArticle);
router.get('/', listArticles);

module.exports = router;