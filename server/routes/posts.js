const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Post = require('../models/Post');

const router = express.Router();

// Get paginated posts
router.get('/', async (req, res) => {
    const count = await Post.estimatedDocumentCount();
    const pagination = 5;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    Post
        // Empty object gets all, but could set 'name: "whatever"' for example
        .find()
        .skip((page - 1) * pagination)
        .limit(pagination)
        .sort({ created_at: -1 })
        .select('_id text created_at')
        .exec()
        .then(response => {
            // Create pagination object
            const paginated = {
                total: count,
                data: response,
                current_page: page,
                last_page: Math.ceil(count / pagination),
                per_page: req.query.pagination,
            };

            res.json({
                success: true,
                msg: 'Successfully fetched posts',
                paginated,
            });
        })
        .catch(err => {
            console.error(err);

            return res.status(500).json({
                success: false,
                msg: 'Unable to fetch posts',
                err: err.message,
            });
        });
});

// Get single post
router.get('/:id', (req, res) => {
    const _id = req.params.id;

    if (!_id) {
        res.status(400).json({
            success: false,
            msg: 'Please provide an ID',
        });
    }

    Post.findById(_id)
        .exec()
        .then(post => {
            if (!post) {
                return res.status(404).json({
                    success: false,
                    msg: 'Post does not exist',
                });
            }

            const url = req.protocol + '://' + req.get('host') + '/api/posts';

            res.status(200).json({
                success: true,
                msg: 'Fetched post',
                post: {
                    _id: post._id,
                    text: post.text,
                    created_at: post.created_at,
                    request: { method: 'GET', url },
                },
            });
        })
        .catch(err => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to fetch post',
                err: err.message,
            });
        });
});

// Add posts
router.post('/', auth, (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({
            success: false,
            msg: 'Please fill required fields',
        });
    }

    const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        text: req.body.text,
        created_at: new Date(),
    });

    post.save()
        .then(post => {
            const url = req.protocol + '://' + req.get('host') + '/api/posts/' + post._id;

            res.status(201).json({
                success: true,
                msg: 'Post created',
                post: {
                    _id: post._id,
                    text: post.text,
                    created_at: post.created_at,
                    request: { method: 'GET', url },
                },
            });
        })
        .catch(err => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to create post',
                err: err.message,
            });
        });
});

// Delete posts
router.delete('/:id', auth, (req, res) => {
    const _id = req.params.id;

    if (!_id) {
        return res.status(400).json({
            success: false,
            msg: 'Please provide an ID',
        });
    }

    Post.deleteOne({ _id })
        .exec()
        .then(result => {
            console.log(result);
            if (!result.deletedCount)
                return res.status(404).json({
                    success: false,
                    msg: 'Post does not exist',
                });

            const url = req.protocol + '://' + req.get('host') + '/api/posts';

            res.status(200).json({
                success: true,
                deleted_id: _id,
                msg: 'Post deleted',
                request: { method: 'GET', url },
            });
        })
        .catch(err => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to delete post',
                err: err.message,
            });
        });
});

module.exports = router;
