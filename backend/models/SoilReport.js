const mongoose = require('mongoose');

const soilReportSchema = new mongoose.Schema({
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    soil_type:  { type: String, required: true },
    confidence: { type: Number, required: true },
    image_url:  { type: String },
    location:   { state: String, district: String }
}, { timestamps: true });

module.exports = mongoose.model('SoilReport', soilReportSchema);
