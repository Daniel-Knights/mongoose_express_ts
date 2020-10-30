const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const AuthController = require('../controllers/AuthController');

// Fetch user data
router.get('/user/:id', auth, AuthController.fetch_user);

// Login user
router.post('/login', AuthController.login);

// Signup user
router.post('/signup', AuthController.signup);

module.exports = router;
