const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const { authRequired } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, me);
router.patch('/me', authRequired, updateProfile);

module.exports = router;