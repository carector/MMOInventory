// Imports
const express = require('express');

// Local imports
const usersController = require('../controllers/users.controller.js');

// Definitions
const router = express.Router();

// Routes
router.route('/').get((req, res) => res.send('User database'));

module.exports = router;
