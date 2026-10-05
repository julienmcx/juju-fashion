const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth');
const { getStatus, createCheckout, createPortal } = require('../controllers/billingController');

// Le webhook est monté à part dans server.js (corps brut requis).
router.get('/status', authRequired, getStatus);
router.post('/checkout', authRequired, createCheckout);
router.post('/portal', authRequired, createPortal);

module.exports = router;
