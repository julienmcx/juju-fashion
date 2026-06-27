const express = require('express');
const router = express.Router();
const { listAvis, createAvis, deleteAvis } = require('../controllers/avisController');

// Avis publics : pas d'authentification (la landing est consultée par tous).
router.get('/', listAvis);
router.post('/', createAvis);
router.delete('/:id', deleteAvis);

module.exports = router;
