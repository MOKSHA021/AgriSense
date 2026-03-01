const express                       = require('express');
const router                        = express.Router();
const { body }                      = require('express-validator');
const { recommendCrop, getCropHistory } = require('../controllers/cropController');
const { protect }                   = require('../middleware/auth');

router.post('/recommend',
    protect,
    [
        body('soil_type').notEmpty().withMessage('soil_type is required'),
        body('temperature').isNumeric().withMessage('temperature must be a number'),
        body('humidity').isNumeric().withMessage('humidity must be a number'),
        body('rainfall').isNumeric().withMessage('rainfall must be a number')
    ],
    recommendCrop
);

router.get('/history', protect, getCropHistory);

module.exports = router;
