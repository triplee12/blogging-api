const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/users');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('User Authentication Controller', () => {
    let userData = {
        email: 'test@example.com',
        password: 'password',
        first_name: 'Test',
        last_name: 'User'
    };

    let token;

    beforeEach(async () => {
        await User.deleteMany({});
    });

    beforeEach(async () => {
        // Create a user and get a token
        await request(app)
            .post('/auth/signup')
            .send(userData)
            .expect(201);

            const response = await request(app)
            .post('/auth/login')
            .send({ email: userData.email, password: userData.password })
            .expect(200);

        token = response.body.token;
    });

    it('should create a new user account', async () => {
        const userData1 = {
            email: 'test1@example.com',
            password: 'password',
            first_name: 'Test',
            last_name: 'User'
        };
        const response = await request(app)
            .post('/auth/signup')
            .send(userData1)
            .expect(201);

        expect(response.body.message).toBe('Account created successfully');
        const user = await User.findOne({ email: userData1.email });
        expect(user).toBeTruthy();
        expect(user.email).toBe(userData1.email);
    });

    it('should login a user and return a token', async () => {
        // Then, login with the same user
        const response = await request(app)
            .post('/auth/login')
            .send({ email: userData.email, password: userData.password })
            .expect(200);

        expect(response.body.token).toBeTruthy();
    });

    it('should fail to login with wrong password', async () => {
        // Try to login with incorrect password
        await request(app)
            .post('/auth/login')
            .send({ email: userData.email, password: 'wrongpassword' })
            .expect(401);
    });

    it('should fail to login with non-existent user', async () => {
        await request(app)
            .post('/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'password' })
            .expect(401);
    });

    it('should update a user account', async () => {
        const updateData = { first_name: 'Updated', last_name: 'User', email: 'updatedemail@exam.com' };
        const user = await User.findOne({ email: userData.email });

        const response = await request(app)
            .put(`/auth/users/${user._id}/update`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData)
            .expect(200);

        expect(response.body.first_name).toBe(updateData.first_name);
        expect(response.body.last_name).toBe(updateData.last_name);
        expect(response.body.email).toBe(updateData.email);

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.first_name).toBe(updateData.first_name);
        expect(updatedUser.last_name).toBe(updateData.last_name);
        expect(updatedUser.email).toBe(updateData.email);
    });

    it('should delete a user account and associated blogs', async () => {
        const user = await User.findOne({ email: userData.email });

        const response = await request(app)
            .delete(`/auth/users/${user._id}/delete`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.message).toBe('User and associated blogs deleted successfully');

        const deletedUser = await User.findById(user._id);
        expect(deletedUser).toBeNull();
    });
});
