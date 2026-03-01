const mlClient = require('../utils/mlClient');

const getPrice = async (req, res) => {
    try {
        const { crop_name, harvest_date } = req.body;
        if (!crop_name || !harvest_date)
            return res.status(400).json({ message: 'crop_name and harvest_date are required' });

        const result = await mlClient.predictPrice({ crop_name, harvest_date });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSupportedCrops = async (req, res) => {
    res.json({
        crops: ['Wheat', 'Rice', 'Maize', 'Mustard', 'Tomato', 'Potato', 'Onion']
    });
};

module.exports = { getPrice, getSupportedCrops };
