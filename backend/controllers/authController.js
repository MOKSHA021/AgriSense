const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, state, district } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, phone, state, district });
        res.status(201).json({
            _id:      user._id,
            name:     user.name,
            email:    user.email,
            state:    user.state,
            district: user.district,
            token:    generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await user.matchPassword(password)) {
            res.json({
                _id:      user._id,
                name:     user.name,
                email:    user.email,
                state:    user.state,
                district: user.district,
                token:    generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        res.json(req.user);
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getProfile };
