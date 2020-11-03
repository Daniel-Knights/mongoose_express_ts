const { response } = require('express');
const mongoose = require('mongoose');

const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts
exports.get_all = async (req, res) => {
    const count = await Post.estimatedDocumentCount();
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    Post
        // Empty argument returns all
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ created_at: -1 })
        .populate('user', '-__v -password -posts')
        .select('-__v')
        .exec()
        .then((response) => {
            // Create limit object
            const paginated = {
                total: count,
                data: response,
                current_page: page,
                last_page: Math.ceil(count / limit),
                per_page: limit,
            };

            res.json({
                success: true,
                msg: 'Successfully fetched posts',
                paginated,
            });
        })
        .catch((err) => {
            console.error(err);

            return res.status(500).json({
                success: false,
                msg: 'Unable to fetch posts',
                err: err.message,
            });
        });
};

// Get single post
exports.get_single = (req, res) => {
    const _id = req.params.id;

    if (!_id) {
        res.status(400).json({
            success: false,
            msg: 'Please provide an ID',
        });
    }

    Post.findById(_id)
        .populate('user', '-__v -password -posts')
        .select('-__v')
        .exec()
        .then((post) => {
            if (!post) {
                return res.status(404).json({
                    success: false,
                    msg: 'Post does not exist',
                });
            }

            // Format GET request for all posts
            const url = req.protocol + '://' + req.get('host') + '/api/posts';

            res.status(200).json({
                success: true,
                msg: 'Fetched post',
                post: {
                    ...post._doc,
                    request: { method: 'GET', url },
                },
            });
        })
        .catch((err) => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to fetch post',
                err: err.message,
            });
        });
};

// Create post
exports.create_post = (req, res) => {
    const { text, user_id } = req.body;

    if (!text) {
        return res.status(400).json({
            success: false,
            msg: 'Please fill required fields',
        });
    }

    const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        text: text,
        user: user_id,
    });

    // Update the users 'posts' array before saving the post
    User.updateOne({ _id: user_id }, { $push: { posts: post } })
        .exec()
        .then(() => {
            post.save()
                .then((post) => {
                    const url = req.protocol + '://' + req.get('host') + '/api/posts/' + post._id;

                    delete post._doc.__v;

                    post.populate('user', '-__v -password -posts', () => {
                        res.status(201).json({
                            success: true,
                            msg: 'Post created',
                            post: {
                                ...post._doc,
                                request: { method: 'GET', url },
                            },
                        });
                    });
                })
                .catch((err) => {
                    console.error('Save post failed: ', err);

                    // Remove associated post from the users' document
                    User.updateOne({ _id: user_id }, { $pull: { posts: post._id } });

                    res.status(500).json({
                        success: false,
                        msg: 'Unable to create post',
                        err: err.message,
                    });
                });
        })
        .catch((err) => {
            console.error('Update users posts failed: ', err);

            res.status(500).json({
                success: false,
                msg: 'Unable to create post',
                err: err.message,
            });
        });
};

// Delete post
exports.delete_post = (req, res) => {
    const _id = req.params.id;

    if (!_id) {
        return res.status(400).json({
            success: false,
            msg: 'Please provide an ID',
        });
    }

    Post.deleteOne({ _id })
        .exec()
        .then((result) => {
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
        .catch((err) => {
            console.error(err);

            res.status(500).json({
                success: false,
                msg: 'Unable to delete post',
                err: err.message,
            });
        });
};
