// Imports
const express = require('express');
const { validationResult } = require('express-validator');

// Local imports
const usersController = require('../controllers/users.controller.js');
const itemsController = require('../controllers/items.controller.js');
const { checkValidation } = require('../common.js');

// Definitions
const router = express.Router();

// Routes
router.route('/health').get((req, res) => res.send('User database'));
router.route('/').get(usersController.getAllUsers);
router.route('/:userID').get(usersController.getUserByID);
router.route('/').post(
	[
		(req, res, next) => {
			console.log(req.body);
			next();
		},
		usersController.vr_createUser,
		checkValidation,
	],
	usersController.createUser
);

// Get all inventory items
router.route('/:userID/inv/').get([], usersController.getInventoryContents);

// Get inventory item by index
router.route('/:userID/inv/:index').get();

// Add item to inventory
router.route('/:userID/inv/:itemID').post(
	[
		// Todo: Authenticate
		itemsController.mw_verifyItemExists,
		//usersController.mw_sanitizeUser,
	],
	usersController.addItemToInventory
);

// Delete inventory item by index
router.route('/:userID/inv/:index').delete([
	// Todo: Authenticate
	//usersController.mw_sanitizeUser,
]);

module.exports = router;
