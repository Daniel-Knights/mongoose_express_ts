const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');
const User = require('../models/User');

// Fetch user data
router.get('/user/:id', auth, (req, res) => {
    const _id = req.user.id;

    if (!_id) {
        res.status(400).json({
            success: false,
            msg: 'Please provide an ID',
        });
    }

    User.findById(_id)
        // All fields except password
        .select('-__v -password')
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    msg: 'User does not exist',
                });
            }

            res.json({ success: true, user });
        })
        .catch(err => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to fetch user',
                err: err.message,
            });
        });
});

// Login user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            msg: 'Please enter all fields',
        });
    }

    // Check for existing user
    User.findOne({ email })
        .select('-__v')
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    msg: 'User does not exist',
                });
            }

            // Validate password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    return res.status(400).json({
                        success: false,
                        msg: 'Invalid credentials',
                    });
                }

                delete user._doc.password;

                jwt.sign(
                    { id: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' },
                    (err, token) => {
                        if (err) throw err;

                        res.json({
                            success: true,
                            token,
                            user,
                            message: 'User logged in',
                        });
                    }
                );
            });
        })
        .catch(err => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to log in user',
                err: err.message,
            });
        });
});

// Signup user
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            msg: 'Please enter all fields',
        });
    }

    // Check for existing user
    User.findOne({ email })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({
                    success: false,
                    msg: 'User already exists',
                });
            }

            // Create salt and hash
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;

                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name,
                    email,
                    password: hash,
                });

                user.save()
                    .then(user => {
                        jwt.sign(
                            { id: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '7d' },
                            (err, token) => {
                                if (err) throw err;

                                delete user._doc.password;
                                delete user._doc.__v;

                                res.status(201).json({
                                    success: true,
                                    token,
                                    user,
                                    message: 'User signed up successfully',
                                });
                            }
                        );
                    })
                    .catch(err => {
                        console.error(err);

                        res.status(500).json({
                            success: false,
                            msg: 'Something went wrong, please try again or contact support',
                            err: err.msg,
                        });
                    });
            });
        });
});

module.exports = router;
