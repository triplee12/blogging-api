// User routes for the blogging api

const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.put('/users/:id/update', authMiddleware.authenticateJWT, userController.updateUser);
router.delete('/users/:id/delete', authMiddleware.authenticateJWT, userController.deleteUser);

module.exports = router;