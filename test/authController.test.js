const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const sinon = require('sinon');
const passport = require('../middleware/authMiddleware');
const logger = require('../log/logger');

jest.mock('../middleware/authMiddleware');

describe('User Authentication Controller', () => {
    describe('POST /signup', () => {
        it('should create a new user account', async () => {
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const saveStub = sinon.stub(User.prototype, 'save').resolves();

            await request(app)
                .post('/signup')
                .send(userData)
                .expect(201)
                .expect('Content-Type', /json/)
                .expect({ message: 'Account created successfully' });

            expect(saveStub.calledOnce).toBe(true);

            saveStub.restore();
        });
    });

    describe('POST /login', () => {
        it('should login a user and return a token', async () => {
            const userData = {
                email: 'jane.doe@example.com',
                password: 'password123'
            };

            const user = new User({
                first_name: 'Jane',
                last_name: 'Doe',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10)
            });

            sinon.stub(User, 'findOne').resolves(user);
            sinon.stub(jwt, 'sign').returns('mocked-token');

            await request(app)
                .post('/login')
                .send(userData)
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ token: 'mocked-token' });

            User.findOne.restore();
            jwt.sign.restore();
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user account', async () => {
            const userData = {
                first_name: 'Mark',
                last_name: 'Smith',
                email: 'mark.smith@example.com'
            };
        
            const userId = 'mocked-user-id';
            const token = 'mocked-token';
        
            const findByIdAndUpdateStub = sinon.stub(User, 'findByIdAndUpdate').resolves(userData);
        
            await request(app)
                .put(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(userData)
                .expect(200)
                .expect('Content-Type', /json/)
                .expect((res) => {
                expect(res.body).toEqual(userData);
                });
        
            expect(findByIdAndUpdateStub.calledOnceWithExactly(userId, userData, { new: true })).toBe(true);
        
            findByIdAndUpdateStub.restore();
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user account and associated blogs', async () => {
            const userId = 'mocked-user-id';
            const token = 'mocked-token';
        
            const findByIdAndDeleteStub = sinon.stub(User, 'findByIdAndDelete').resolves();
            const deleteManyStub = sinon.stub(Blog, 'deleteMany').resolves();
        
            await request(app)
                .delete(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ message: 'User and associated blogs deleted successfully' });
        
            expect(findByIdAndDeleteStub.calledOnceWithExactly(userId)).toBe(true);
            expect(deleteManyStub.calledOnceWithExactly({ author: userId })).toBe(true);
        
            findByIdAndDeleteStub.restore();
            deleteManyStub.restore();
        });
    });
});
