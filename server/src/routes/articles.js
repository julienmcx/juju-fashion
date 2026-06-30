const express = require('express');
const router = express.Router();
const {
  createArticle, listArticles,
  getArticle, updateArticle, deleteArticle, toggleFavori, reorderArticles
} = require('../controllers/articlesController');
const { authRequired } = require('../middlewares/auth');

router.use(authRequired);

router.post('/', createArticle);
router.get('/', listArticles);
router.patch('/reorder', reorderArticles);
router.get('/:id', getArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.patch('/:id/favori', toggleFavori);
module.exports = router;