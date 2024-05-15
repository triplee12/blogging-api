// Blog routes for the blogging api

const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.authenticateJWT, blogController.createBlog);
router.get('/user', authMiddleware.authenticateJWT, blogController.getUserBlogs);
router.get('/published', blogController.getPublishedBlogs);
router.get('/published/:id', blogController.getBlogById);
router.put('/:id/update', authMiddleware.authenticateJWT, blogController.updateBlog);
router.delete('/:id/delete', authMiddleware.authenticateJWT, blogController.deleteBlog);

module.exports = router;
