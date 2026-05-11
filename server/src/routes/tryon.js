const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth');
const { createTryOn, getQuota } = require('../controllers/tryonController');

router.use(authRequired);

router.post('/', createTryOn);
router.get('/quota', getQuota);

module.exports = router;