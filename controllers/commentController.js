// Comments controller for blogging api

const Comment = require('../models/comments');
const Blog = require('../models/blogs');
const logger = require('../log/logger');

exports.createComment = async (req, res) => {
    try {
        const { blog_id, content } = req.body;
        const user_id = req.user._id;

        const blog = await Blog.findById(blog_id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const comment = new Comment({
            blog_id,
            user_id,
            content
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        logger.error(`Error creating comment: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getCommentsByBlogId = async (req, res) => {
    try {
        const { blog_id } = req.params;
        const comments = await Comment.find({ blog_id }).populate('user_id', 'first_name last_name');
        res.json(comments);
    } catch (error) {
        logger.error(`Error retrieving comments: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await comment.deleteOne();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting comment: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
