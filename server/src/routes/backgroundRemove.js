const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth');
const { removeBackground } = require('../controllers/backgroundRemoveController');

router.use(authRequired);
router.post('/', removeBackground);

module.exports = router;
