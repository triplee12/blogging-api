// Comment controller test cases

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');
const Blog = require('../models/blogs');
const Comment = require('../models/comments');
const jwt = require('jsonwebtoken');

describe('Comment API', () => {
    let token;
    let userId;
    let blogId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const user = new User({ first_name: 'Test', last_name: 'User', email: 'test@example.com', password: 'password' });
        await user.save();
        userId = user._id;

        token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const blog = new Blog({ title: 'Test Blog', description: 'Test Description', body: 'Test Body', tags: ['test', 'comment'], author: user._id });
        await blog.save();
        blogId = blog._id;
    });

    afterAll(async () => {
        await Comment.deleteMany({});
        await Blog.deleteMany({});
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    test('should create a comment', async () => {
        const response = await request(app)
            .post('/api/v1/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ blog_id: blogId, content: 'Test Comment' });

        expect(response.status).toBe(201);
        expect(response.body.content).toBe('Test Comment');
    });

    test('should get comments for a blog', async () => {
        const response = await request(app)
            .get(`/api/v1/comments/${blogId}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('should delete a comment', async () => {
        const comment = new Comment({ blog_id: blogId, user_id: userId, content: 'Test Comment' });
        await comment.save();

        const response = await request(app)
            .delete(`/api/v1/comments/${comment._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Comment deleted successfully');
    });
});
