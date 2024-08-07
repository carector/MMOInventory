// Imports
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAnalytics } = require('firebase/analytics');
const express = require('express');
const { Sequelize } = require('sequelize');
const config = require('./config.json');
const routes = require('./routes/index.route.js');

// Definitions
const port = config.port;
let fb_app;
let fb_analytics;
let fb_db;
let app;

async function init() {
	// Set up DB connection
	try {
		await setUpFirebase();
	} catch (err) {
		console.error(`Error initializing Firebase: ${err}`);
		return;
	}

	// Set up app + routes
	app = express();
	app.use(routes);

	app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
}

async function setUpFirebase() {
	// Set up config
	const firebaseConfig = {
		apiKey: process.env.FIREBASE_API_KEY,
		authDomain: process.env.FIREBASE_AUTH_DOMAIN,
		projectId: process.env.FIREBASE_PROJECT_ID,
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
		appId: process.env.FIREBASE_APP_ID,
		measurementId: process.env.FIREBASE_MEASUREMENT_ID,
	};

	// Connect to app + db + analytics
	fb_app = initializeApp(firebaseConfig);
	fb_db = getFirestore(fb_app);
	fb_analytics = getAnalytics(fb_app);

	// Verify connection
}

// Initialize app
init().catch((err) => {
	console.error(`Unable to initialize: ${err}`);
});
