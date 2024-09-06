// Imports
const express = require('express');
const users = require('./users.route.js');
const items = require('./items.route.js');
const path = require('path');

// Definitions
const router = express.Router();

// Backend endpoints
router.use('/users', users);
router.use('/itemCatalog', items);

// Test view endpoints
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../', '/views/index.html'));
});

router.get('/health', (req, res) => {
	const healthCheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now(),
	};
	res.send(JSON.stringify(healthCheck));
});

module.exports = router;
