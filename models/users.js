// Users model for the blogging API

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;