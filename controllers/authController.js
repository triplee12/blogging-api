//User authentication controller for blogging api

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Blog = require('../models/blogs');
const passport = require('../middleware/authMiddleware');
const logger = require('../log/logger');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });
        await user.save();
        logger.info('Account created successfully');
        res.status(201).json({ "message": "Account created successfully" });
    } catch (error) {
        logger.error(`Error creating account: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            logger.error(`Unauthorized: ${info.message}`);
            return res.status(401).json({ message: info.message });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                logger.error(`Error creating account: ${err.message}`);
            return next(err);
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token });
        });
    })(req, res, next);
};

exports.updateUser = async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            logger.error('User not found');
            return res.status(404).json({ error: "User not found" });
        }
        user.first_name = first_name;
        user.last_name = last_name;
        user.email = email;
        user.updated_at = Date.now();
        await user.save();
        res.json(user);
    } catch (error) {
        logger.error(`Error updating account: ${error.message}`);
        res.status(500).json({ error: error.message })
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        await Blog.deleteMany({ author: userId });
        res.json({ message: 'User and associated blogs deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting account: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
