const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: { type: String, required: true },
    created_at: { type: Date, required: true },
});

module.exports = mongoose.model('Post', postSchema);
