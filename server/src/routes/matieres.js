const express = require('express');
const router = express.Router();
const { listMatieres } = require('../controllers/matieresController');
const { authRequired } = require('../middlewares/auth');

router.use(authRequired);
router.get('/', listMatieres);

module.exports = router;