// Imports
const express = require('express');
const { check, param } = require('express-validator');
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
		[
			param('userId').exists().notEmpty().withMessage('User ID required'),
		],
		checkValidation,
		usersController.getUserById
	], 
	(req, res, next) => {
		return res.status(200).send(res.locals.userData);
	}
);

// Create new user
router.route('/').post(
	[
		[
			check('name')
				.notEmpty()
				.withMessage('User name required')
				.isLength({ max: 40 }),	
		],
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
		usersController.getInventoryItemById,
		// TODO: Unequip item if ID matches
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
		// TODO: Validation rules - verify that equip slot begins with lowercase and matches one of equipment slot fields
		usersController.getInventoryItemById,
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
router.route('/:userId/inv/buy/:itemId').post(
	[
		usersController.getUserById,
		// Placeholder until items.controller is updated
		(req, res, next) => {
			console.log("Here");
			res.locals.transactionAmount = -10;
			next();
		},
		usersController.updateGoldValue,
		usersController.addItemToInventory
	],
	(req, res) => {
		return res.status(200).send({
			message: 'Successfully purchased item.',
			inventoryItemId: res.locals.invItemId,
			inventoryItem: res.locals.invItem,
		});
	}
);


module.exports = router;
