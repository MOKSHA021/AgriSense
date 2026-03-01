const express = require('express');
const router  = express.Router();
const { recommendCrop, getCropHistory } = require('../controllers/cropController');
const { protect } = require('../middleware/auth');

router.post('/recommend', protect, recommendCrop);
router.get('/history',    protect, getCropHistory);

module.exports = router;
