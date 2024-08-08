// Imports
const express = require('express');
const users = require('./users.route.js');
const items = require('./items.route.js');

// Definitions
const router = express.Router();

router.use('/users', users);
router.use('/itemCatalog', items);

router.get('/', (req, res) => res.send('MMO Inventory Project'));
router.get('/health', (req, res) => {
	const healthCheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now(),
	};
	res.send(JSON.stringify(healthCheck));
});

module.exports = router;