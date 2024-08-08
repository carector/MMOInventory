// Imports
const express = require('express');
const { Sequelize } = require('sequelize');
const config = require('./config.json');
const routes = require('./routes/index.route.js');
const { db } = require('./fb.js');
const bodyParser = require('body-parser');
require('dotenv').config();

// Definitions
const port = config.port;
let app;

async function init() {
	// Verify DB connection
	if (!db) {
		console.error(`Error initializing Firebase: ${err}`);
		return;
	}

	// Set up app
	app = express();
	app.use(bodyParser.json());
	app.use(express.json());
	app.use(routes);

	app.listen(port, () => {
		console.log(`Done! Listening on port ${port}`);
	});
}

// Initialize app
init().catch((err) => {
	console.error(`Unable to initialize: ${err}`);
});
