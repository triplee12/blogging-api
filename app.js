// Entry point to the blogging api

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/users');
require('dotenv').config();

const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/blogapi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error: ', error);
    });

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});