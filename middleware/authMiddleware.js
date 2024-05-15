const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const logger = require('../log/logger');
require('dotenv').config();

// Local Strategy for username/password authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    async (email, password, done) => {
        try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
        } catch (error) {
            logger.error(`Error logging in a user: ${error.message}`);
            return done(error);
        }
    }
));

// JWT Strategy for token authentication
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, done) => {
        try {
        const user = await User.findById(jwtPayload.userId);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
        } catch (error) {
            logger.error(`Error generating bearer token: ${error.message}`);
            return done(error);
        }
    }
));

// Middleware function for authenticating using Passport LocalStrategy
const authenticateLocal = passport.authenticate('local', { session: false });

// Middleware function for authenticating using Passport JWTStrategy
const authenticateJWT = passport.authenticate('jwt', { session: false });

module.exports = { authenticateLocal, authenticateJWT };
