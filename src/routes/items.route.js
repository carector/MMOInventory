// Packages
const express = require('express');

// Local imports
const itemsController = require('../controllers/items.controller.js');

// Definitions
const router = express.Router();

// Routes
router.route('/').get((req, res) => res.send("Item database"));

module.exports = router;
