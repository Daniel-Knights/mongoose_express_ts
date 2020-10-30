const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const PostsController = require('../controllers/PostsController');

// Get paginated posts
router.get('/', PostsController.get_all);

// Get single post
router.get('/:id', PostsController.get_single);

// Create post
router.post('/', auth, PostsController.create_post);

// Delete post
router.delete('/:id', auth, PostsController.delete_post);

module.exports = router;
