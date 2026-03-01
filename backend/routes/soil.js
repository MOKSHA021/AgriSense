const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { analyzeSoil, getSoilHistory } = require('../controllers/soilController');
const { protect } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/analyze',  protect, upload.single('file'), analyzeSoil);
router.get('/history',   protect, getSoilHistory);

module.exports = router;
