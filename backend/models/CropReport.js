const mongoose = require('mongoose');

const cropReportSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    soil_type:   { type: String },
    temperature: { type: Number },
    humidity:    { type: Number },
    rainfall:    { type: Number },
    crops:       [{ crop: String, score: Number }],
    selected_crop: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CropReport', cropReportSchema);
