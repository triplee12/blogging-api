const request = require('supertest');
const app = require('../app'); // Path to your Express app
const mongoose = require('mongoose');
const Blog = require('../models/blogs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Mock user for authentication
const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123'
};

const mockToken = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await User.create(mockUser);
});

afterAll(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
    await mongoose.connection.close();
});

describe('Blog Controller', () => {

    describe('POST /api/v1/blogs', () => {
        it('should create a new blog', async () => {
        const blogData = {
            title: 'Test Blog',
            description: 'This is a test blog description',
            tags: ['test', 'blog'],
            body: 'This is the body of the test blog'
        };

        const response = await request(app)
            .post('/api/v1/blogs')
            .set('Authorization', `Bearer ${mockToken}`)
            .send(blogData)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject(blogData);
        });
    });

    describe('GET /api/v1/blogs/user', () => {
        it('should get blogs for the authenticated user', async () => {
        const response = await request(app)
            .get('/api/v1/blogs/user')
            .set('Authorization', `Bearer ${mockToken}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/v1/blogs/published', () => {
        it('should get all published blogs', async () => {
        const response = await request(app)
            .get('/api/v1/blogs/published')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/v1/blogs/published/:id', () => {
        it('should get a published blog by id', async () => {
        const blog = await Blog.create({
            title: 'Test Blog 1',
            description: 'This is a test blog description',
            tags: ['test', 'blog'],
            body: 'This is the body of the test blog',
            author: mockUser._id,
            state: 'published'
        });

        const response = await request(app)
            .get(`/api/v1/blogs/published/${blog._id}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject({ title: 'Test Blog 1' });
        });
    });

    describe('PUT /api/v1/blogs/:id/update', () => {
        it('should update a blog', async () => {
            const blog = await Blog.create({
                title: 'Test Blog 2',
                description: 'This is a test blog description',
                tags: ['test', 'blog'],
                body: 'This is the body of the test blog',
                author: mockUser._id,
                state: 'draft'
            });

            const updatedData = {
                title: 'Updated Blog Title',
                description: 'Updated description',
                tags: ['updated', 'blog'],
                body: 'Updated blog body',
                state: 'published'
            };

            const response = await request(app)
                .put(`/api/v1/blogs/${blog._id}/update`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send(updatedData)
                .expect(200)
                .expect('Content-Type', /json/);

            expect(response.body).toMatchObject(updatedData);
        });
    });

    describe('DELETE /api/v1/blogs/:id/delete', () => {
        it('should delete a blog', async () => {
            const blog = await Blog.create({
                title: 'Test Blog Delete',
                description: 'This is a test blog description',
                tags: ['test', 'blog'],
                body: 'This is the body of the test blog',
                author: mockUser._id,
                state: 'draft'
            });

            const response = await request(app)
                .delete(`/api/v1/blogs/${blog._id}/delete`)
                .set('Authorization', `Bearer ${mockToken}`)
                .expect(200);

            const deletedBlog = await Blog.findById(blog._id);
            expect(deletedBlog).toBeNull();
        });
    });

});
