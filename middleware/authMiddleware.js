// Authentication middleware

const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
