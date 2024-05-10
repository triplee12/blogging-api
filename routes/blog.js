// Blog routes for the blogging api

const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware.verifyToken, blogController.createBlog);
router.get('/published', blogController.getPublishedBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id/update', authMiddleware.verifyToken, blogController.updateBlog);
router.delete('/:id/delete', authMiddleware.verifyToken, blogController.deleteBlog);

module.exports = router;
