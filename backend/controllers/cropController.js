const mlClient   = require('../utils/mlClient');
const CropReport = require('../models/CropReport');

const recommendCrop = async (req, res) => {
    try {
        const { soil_type, temperature, humidity, rainfall } = req.body;
        if (!soil_type || !temperature || !humidity || !rainfall)
            return res.status(400).json({ message: 'All fields required: soil_type, temperature, humidity, rainfall' });

        const result = await mlClient.predictCrop({ soil_type, temperature, humidity, rainfall });

        await CropReport.create({
            user: req.user._id,
            soil_type, temperature, humidity, rainfall,
            crops: result.crops
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCropHistory = async (req, res) => {
    try {
        const reports = await CropReport.find({ user: req.user._id }).sort('-createdAt').limit(10);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { recommendCrop, getCropHistory };
