const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const mlClient = {
    predictSoil: async (formData) => {
        const res = await axios.post(`${ML_URL}/predict/soil`, formData, {
            headers: formData.getHeaders()
        });
        return res.data;
    },

    predictCrop: async (data) => {
        const res = await axios.post(`${ML_URL}/predict/crop`, data);
        return res.data;
    },

    predictPrice: async (data) => {
        const res = await axios.post(`${ML_URL}/predict/price`, data);
        return res.data;
    }
};

module.exports = mlClient;
