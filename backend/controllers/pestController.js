const axios = require("axios");
const FormData = require("form-data");

const detectPest = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided." });
        }

        // Construct FormData to send the bits to Python ml-service
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // ml-service runs on localhost:8000 natively, or ml-service:8000 in Docker
        const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
        const pythonServiceResponse = await axios.post(`${ML_URL}/predict/pest`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        return res.json(pythonServiceResponse.data);
    } catch (error) {
        console.error("Error communicating with Python ML service:", error.message);
        return res.status(500).json({ success: false, message: "Failed to analyze pest image." });
    }
};

module.exports = {
    detectPest
};
