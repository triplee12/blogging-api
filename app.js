// Entry point to the blogging api

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/users');
const blogRoutes = require('./routes/blog');
const passport = require('./middleware/authMiddleware');
const logger = require('./log/logger');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(passport.initialize());

mongoose.connect('mongodb://localhost:27017/blogapi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        logger.info('Connected to MongoDB');
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        logger.error(`MongoDB connection error: ${error.message}`);
        console.error('MongoDB connection error: ', error);
    });

app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
