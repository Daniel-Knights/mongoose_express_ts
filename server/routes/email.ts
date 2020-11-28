import type { Router } from 'express';
import express = require('express');

const router: Router = express.Router();

const DirectEmailController = require('../controllers/DirectEmailController');

// Direct email from user to site owner
router.post('/direct', DirectEmailController.send);

module.exports = router;
