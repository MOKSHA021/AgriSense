const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

// Memory storage to keep things fast, we don't save to disk.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/detect", upload.single("image"), async (req, res) => {
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

        // ml-service runs on localhost:8000 natively
        const pythonServiceResponse = await axios.post("http://localhost:8000/predict/pest", form, {
            headers: {
                ...form.getHeaders()
            }
        });

        return res.json(pythonServiceResponse.data);
    } catch (error) {
        console.error("Error communicating with Python ML service:", error.message);
        return res.status(500).json({ success: false, message: "Failed to analyze pest image." });
    }
});

module.exports = router;
