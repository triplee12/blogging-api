// Blog controller for blogging api

const Blog = require('../models/blogs');

exports.createBlog = async (req, res) => {
    try {
        const { title, description, tags, body } = req.body;
        const blog = new Blog({
            title,
            description,
            author: req.user._id,
            tags,
            body,
        });
        await blog.save();
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPublishedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ state: 'published' }).populate('author', 'first_name last_name');
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate('author', 'first_name last_name');
        if (!blog) {
            return res.status(404).json({ error: error.message });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, body, state } = req.body;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        blog.title = title;
        blog.description = description;
        blog.tags = tags;
        blog.body = body;
        blog.state = state;
        await blog.save()
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = Blog.findById(id);
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await blog.remove();
        res.status(301).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
