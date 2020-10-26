const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, requires: true },
    created_at: { type: Date, required: true },
});

module.exports = mongoose.model('User', userSchema);
