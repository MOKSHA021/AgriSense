const express = require('express');
const router  = express.Router();
const { getPrice, getSupportedCrops } = require('../controllers/priceController');
const { protect } = require('../middleware/auth');

router.post('/predict', protect, getPrice);
router.get('/crops',    protect, getSupportedCrops);

module.exports = router;
