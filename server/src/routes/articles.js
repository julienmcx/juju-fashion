const express = require('express');
const router = express.Router();
const {
  createArticle, listArticles,
  getArticle, updateArticle, deleteArticle
} = require('../controllers/articlesController');
const { authRequired } = require('../middlewares/auth');

router.use(authRequired);

router.post('/', createArticle);
router.get('/', listArticles);
router.get('/:id', getArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

module.exports = router;