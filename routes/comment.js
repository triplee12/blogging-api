// Comments routes

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Create a comment
router.post('/', authenticateJWT, commentController.createComment);

// Get comments for a specific blog
router.get('/:blog_id', commentController.getCommentsByBlogId);

// Delete a comment
router.delete('/:id', authenticateJWT, commentController.deleteComment);

module.exports = router;
