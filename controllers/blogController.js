// Blog controller for blogging api

const Blog = require('../models/blogs');
const logger = require('../log/logger');

exports.createBlog = async (req, res) => {
    try {
        const { title, description, tags, body, state } = req.body;
        const wordCount = body.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        const blog = new Blog({
            title,
            description,
            author: req.user._id,
            tags,
            body,
            reading_time: readingTime,
            state: state || 'draft',
        });
        await blog.save();
        res.json(blog);
    } catch (error) {
        logger.error(`Error creating blog: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }

        const search = {};
        if (req.query.search) {
            search.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const sort = {};
        if (req.query.orderBy && ['read_count', 'reading_time', 'timestamp'].includes(req.query.orderBy)) {
            sort[req.query.orderBy] = req.query.order === 'desc' ? -1 : 1;
        } else {
            sort.timestamp = -1;
        }

        const userId = req.user._id; // Get the user ID from the authenticated user
        const blogs = await Blog.find({ ...filter, ...search, author: userId })
            .sort(sort)
            .skip(skip)
            .limit(limit);
        res.json(blogs);
    } catch (error) {
        logger.error(`Error retriving user's blogs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getPublishedBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }

        const search = {};
        if (req.query.search) {
            search.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { author: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const sort = {};
        if (req.query.orderBy && ['read_count', 'reading_time', 'timestamp'].includes(req.query.orderBy)) {
            sort[req.query.orderBy] = req.query.order === 'desc' ? -1 : 1;
        } else {
            sort.timestamp = -1;
        }

        const blogs = await Blog.find({ ...filter, ...search, state: 'published' })
            .populate('author', 'first_name last_name')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        res.json(blogs);
    } catch (error) {
        logger.error(`Error retriing published blogs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findOne({ _id: id, state: 'published' }).populate('author', 'first_name last_name');
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found or not published' });
        }
        blog.read_count += 1;
        await blog.save();
        res.json(blog);
    } catch (error) {
        logger.error(`Error retriving a blog: ${error.message}`);
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
        logger.error(`Error updating a blog: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await blog.deleteOne();
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting a blog: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
