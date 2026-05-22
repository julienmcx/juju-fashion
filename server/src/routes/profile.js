const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth');
const { getStats, updateAvatar } = require('../controllers/profileController');

router.use(authRequired);
router.get('/stats', getStats);
router.put('/avatar', updateAvatar);

module.exports = router;
