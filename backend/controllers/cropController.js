const { validationResult } = require('express-validator');
const mlClient   = require('../utils/mlClient');
const CropReport = require('../models/CropReport');

// UP-relevant crops whitelist
const UP_CROPS = [
    'wheat', 'rice', 'maize', 'sugarcane', 'potato', 'tomato',
    'onion', 'mustard', 'chickpea', 'pea', 'lentil', 'soybean',
    'cotton', 'barley', 'millet', 'sorghum', 'groundnut', 'sunflower'
];

const recommendCrop = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { soil_type, temperature, humidity, rainfall } = req.body;
        const result = await mlClient.predictCrop({ soil_type, temperature, humidity, rainfall });

        // Filter to UP-relevant crops only
        const filtered = result.crops.filter(c => UP_CROPS.includes(c.crop.toLowerCase()));

        // Only apply filter if we have at least 3 UP-relevant crops, otherwise return all
        const finalCrops = filtered.length >= 3 ? filtered : result.crops;

        await CropReport.create({
            user: req.user._id,
            soil_type, temperature, humidity, rainfall,
            crops: finalCrops
        });

        res.json({ crops: finalCrops });
    } catch (error) {
        next(error);
    }
};

const getCropHistory = async (req, res, next) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const total   = await CropReport.countDocuments({ user: req.user._id });
        const reports = await CropReport.find({ user: req.user._id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.json({ total, page, pages: Math.ceil(total / limit), reports });
    } catch (error) {
        next(error);
    }
};

module.exports = { recommendCrop, getCropHistory };
