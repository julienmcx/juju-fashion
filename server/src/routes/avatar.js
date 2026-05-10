const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { listPhotos, uploadPhoto, deletePhoto } = require('../controllers/avatarController');

router.use(authRequired);

router.get('/photos', listPhotos);
router.post('/photos', upload.single('image'), uploadPhoto);
router.delete('/photos/:angle', deletePhoto);

module.exports = router;