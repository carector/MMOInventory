// Packages
const express = require('express');

// Local imports
const config = require('./config.json')
const routes = require('./routes/index.route.js');

// Definitions
const port = config.port;
let app;

async function init() {
	// Set up app + routes
	app = express();
	app.use(routes);

	app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
}

// Initialize app
init().catch((err) => {
	console.error(`Unable to initialize: ${err}`);
});