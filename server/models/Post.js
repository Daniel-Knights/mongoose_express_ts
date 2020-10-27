const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: { type: String, required: true },
    created_at: { type: Date, default: new Date() },
});

module.exports = mongoose.model('Post', postSchema);
