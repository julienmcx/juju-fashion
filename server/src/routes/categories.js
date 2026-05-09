const express = require('express');
const router = express.Router();
const { listCategories } = require('../controllers/categoriesController');
const { authRequired } = require('../middlewares/auth');

router.use(authRequired);
router.get('/', listCategories);

module.exports = router;