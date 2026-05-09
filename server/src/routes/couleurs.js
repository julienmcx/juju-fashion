const express = require('express');
const router = express.Router();
const { listCouleurs } = require('../controllers/couleursController');
const { authRequired } = require('../middlewares/auth');

router.use(authRequired);
router.get('/', listCouleurs);

module.exports = router;