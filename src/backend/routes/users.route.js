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
router.route('/:userID').get(
	[
		usersController.mw_getUserByID
	], 
	(req, res, next) => {
		return res.status(200).send(req.body.userResult);
	}
);

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
		//itemsController.mw_verifyItemExists
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

// Get equipped items
//router.route('/:userID/inv/equipped').get([usersController.mw_sanitizeUser]);
router.route('/:userID/inv/equip/:invItemID').post(
	[
		usersController.mw_verifyInventoryItemExists,
		usersController.mw_getUserByID
	], 
	usersController.equipItem
);

router.route('/:userID/inv/unequip/:slot').post(
	[
		usersController.mw_getUserByID
	], 
	usersController.unequipItem
);
//router.route('/:userID/inv/buyItem').post([], usersController.unequipItem);




module.exports = router;
