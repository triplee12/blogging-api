// User routes for the blogging api

const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;