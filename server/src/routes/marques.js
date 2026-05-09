const express = require('express');
const router = express.Router();
const { listMarques, createMarque } = require('../controllers/marquesController');
const { authRequired } = require('../middlewares/auth');

router.use(authRequired);
router.get('/', listMarques);
router.post('/', createMarque);

module.exports = router;