const FormData   = require('form-data');
const fs         = require('fs');
const path       = require('path');
const mlClient   = require('../utils/mlClient');
const SoilReport = require('../models/SoilReport');

const analyzeSoil = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const result = await mlClient.predictSoil(formData);

        const report = await SoilReport.create({
            user:       req.user._id,
            soil_type:  result.soil_type,
            confidence: result.confidence,
            location:   { state: req.user.state, district: req.user.district }
        });

        // Delete temp file after upload
        fs.unlinkSync(req.file.path);

        res.json({
            soil_type:  result.soil_type,
            confidence: result.confidence,
            report_id:  report._id
        });
    } catch (error) {
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(error);
    }
};

const getSoilHistory = async (req, res, next) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const total   = await SoilReport.countDocuments({ user: req.user._id });
        const reports = await SoilReport.find({ user: req.user._id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.json({ total, page, pages: Math.ceil(total / limit), reports });
    } catch (error) {
        next(error);
    }
};

module.exports = { analyzeSoil, getSoilHistory };
