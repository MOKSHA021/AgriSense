const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { detectPest } = require("../controllers/pestController");

router.post("/detect", upload.single("image"), detectPest);

module.exports = router;
