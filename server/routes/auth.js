import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (should be protected in production or removed after initial setup)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
        username,
        password,
    });

    if (user) {
        res.status(201).json({
            success: true,
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid user data' });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    const user = {
        _id: req.user._id,
        username: req.user.username,
    };
    res.json({ success: true, data: user });
});

export default router;
