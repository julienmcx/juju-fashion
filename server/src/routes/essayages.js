const express = require('express');
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/essayagesController');

const router = express.Router();

router.use(authRequired);

router.get('/', ctrl.listEssayages);
router.get('/:id', ctrl.getEssayage);
router.post('/:id/save', ctrl.saveEssayage);
router.delete('/:id', ctrl.deleteEssayage);

module.exports = router;