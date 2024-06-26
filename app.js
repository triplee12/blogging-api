// Entry point to the blogging api

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/users');
const blogRoutes = require('./routes/blog');
const commentRoutes = require('./routes/comment');
const logger = require('./log/logger');
const httpLogger = require('./log/httpLogger');
const blogRoutesConfig = require('./routesConfig/blogRoutesConfig');
const userRoutesConfig = require('./routesConfig/userRoutesConfig');
const commentRoutesConfig = require('./routesConfig/commentRoutesConfig');
require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const app = express();

app.use(express.json());
app.use(httpLogger)

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/comments', commentRoutes);

const allRoutesConfig = [
    ...blogRoutesConfig,
    ...userRoutesConfig,
    ...commentRoutesConfig
];

app.get('/api/v1/', (req, res) => {
    res.json(allRoutesConfig);
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        if (process.env.NODE_ENV !== 'test') {
            logger.info('Connected to MongoDB');
            console.log('Connected to MongoDB');
        }
    })
    .catch((error) => {
        logger.error(`MongoDB connection error: ${error.message}`);
        console.error(`MongoDB connection error: ${error.message}`);
    });

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        logger.info(`Server started on http://localhost:${PORT}`)
    });
}

module.exports = app;
