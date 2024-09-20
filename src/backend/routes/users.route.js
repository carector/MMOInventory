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
router.route('/:userId').get(
	[
		usersController.getUserById
	], 
	(req, res, next) => {
		return res.status(200).send(res.locals.userData);
	}
);

// Create new user
router.route('/').post(
	[
		usersController.vr_createUser,
		checkValidation,
		usersController.createUser
	],
	(req, res) => {
		return res.status(200).send({
			message: 'Successfully created user.',
			userId: res.locals.userId,
			user: res.locals.userData,
		});
	}
);

// Get all inventory items
router.route('/:userId/inv/').get(
	[
		usersController.getInventoryContents
	], 
	(req, res) => {
		return res.status(200).send(res.locals.inventory);
	}
);

// Get inventory item by Id
router.route('/:userId/inv/:invItemId').get(
	[
		usersController.verifyInventoryItemExists,
		usersController.getInventoryItemById
	],
	(req, res) => {
		return res.status(200).send(res.locals.invItemResult);	
	}
);

// Add item to inventory
router.route('/:userId/inv/:itemId').post(
	[
		// Todo: Authenticate
		//itemsController.mw_verifyItemExists
		usersController.addItemToInventory
	],
	(req, res) => {
		return res.status(200).send({
			message: 'Successfully added item to inventory.',
			inventoryItemId: res.locals.invItemId,
			inventoryItem: res.locals.invItem,
		});
	}
);

// Delete inventory item by Id
router.route('/:userId/inv/:invItemId').delete(
	[
		// Todo: Authenticate
		usersController.verifyInventoryItemExists,
		usersController.removeItemFromInventory
	],
	(req, res) => {
		return res.status(200).send({
			message: `Item with ID ${req.params.invItemId} deleted successfully`,
		});
	}
);

// Get equipped items
//router.route('/:userId/inv/equipped').get();

// Equip item
router.route('/:userId/inv/equip/:invItemId').post(
	[
		usersController.verifyInventoryItemExists,
		usersController.getUserById,
		usersController.equipItem
	], 
	(req, res) => {
		return res.status(200).send({
			message: `Equipped ${req.params.invItemId} to ${req.body.slot}`,
		});
	}
);

// Unequip item
router.route('/:userId/inv/unequip/:slot').post(
	[
		usersController.getUserById,
		usersController.unequipItem
	], 
	(req, res) => {
		return res.status(200).send({
			message: `Unequipped ${req.params.slot}`,
		});
	}
);
//router.route('/:userId/inv/buyItem').post([], usersController.unequipItem);


module.exports = router;
