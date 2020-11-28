import mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    created_at: { type: Date, default: new Date() },
});

module.exports = mongoose.model('Post', postSchema);
