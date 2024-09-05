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

// TODO: Make ID capitalization consistent (use Id everywhere instead of ID)

// Get inventory item by ID
router
	.route('/:userID/inv/:invItemID')
	.get(
		[usersController.mw_verifyInventoryItemExists],
		usersController.getInventoryItemById
	);

// Add item to inventory
router.route('/:userID/inv/:itemID').post(
	[
		// Todo: Authenticate
		itemsController.mw_verifyItemExists,
		//usersController.mw_sanitizeUser,
	],
	usersController.addItemToInventory
);

// Delete inventory item by ID
router.route('/:userID/inv/:invItemID').delete(
	[
		// Todo: Authenticate
		// Make sure inventory item is present in user's inventory
		usersController.mw_verifyInventoryItemExists,
	],
	usersController.removeItemFromInventory
);

module.exports = router;
