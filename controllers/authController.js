//User authentication controller for blogging api

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Blog = require('../models/blogs');
require('dotenv').config();

const generateToken = (userId) => {
    try {
        return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '3h' });
    } catch (error) {
        throw new Error('Failed to generate JWT token');
    }
};

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
        res.status(201).json({ "message": "Account created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = generateToken(user._id);
        res.json({ 'Bearer': token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.first_name = first_name;
        user.last_name = last_name;
        user.email = email;
        user.updated_at = Date.now();
        await user.save();
        res.json(user);
    } catch (error) {
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
        res.status(500).json({ error: error.message });
    }
};
