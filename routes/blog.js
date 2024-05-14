// Blog routes for the blogging api

const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.authenticate('jwt', { session: false }), blogController.createBlog);
router.get('/user', authMiddleware.authenticate('jwt', { session: false }), blogController.getUserBlogs);
router.get('/published', blogController.getPublishedBlogs);
router.get('/published/:id', blogController.getBlogById);
router.put('/:id/update', authMiddleware.authenticate('jwt', { session: false }), blogController.updateBlog);
router.delete('/:id/delete', authMiddleware.authenticate('jwt', { session: false }), blogController.deleteBlog);

module.exports = router;
