const FormData   = require('form-data');
const fs         = require('fs');
const mlClient   = require('../utils/mlClient');
const SoilReport = require('../models/SoilReport');

const analyzeSoil = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const result = await mlClient.predictSoil(formData);

        // Save report to DB
        const report = await SoilReport.create({
            user:       req.user._id,
            soil_type:  result.soil_type,
            confidence: result.confidence,
            location:   { state: req.user.state, district: req.user.district }
        });

        // Delete temp file
        fs.unlinkSync(req.file.path);

        res.json({
            soil_type:  result.soil_type,
            confidence: result.confidence,
            report_id:  report._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSoilHistory = async (req, res) => {
    try {
        const reports = await SoilReport.find({ user: req.user._id }).sort('-createdAt').limit(10);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { analyzeSoil, getSoilHistory };
