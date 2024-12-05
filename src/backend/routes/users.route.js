// Imports
const express = require('express');
const { check, param } = require('express-validator');
const { validationResult } = require('express-validator');

// Local imports
const usersController = require('../controllers/users.controller.js');
const authController = require('../controllers/auth.controller.js');
const itemsController = require('../controllers/items.controller.js');
const { checkValidation } = require('../common.js');
const { EquipmentType } = require('../models/items.model.js');

// Definitions
const router = express.Router();

// Routes
router.route('/health').get((req, res) => res.send('User database'));
router.route('/').get(usersController.getAllUsers);
router
	.route('/:userId')
	.get(
		[
			[
				param('userId')
					.exists()
					.notEmpty()
					.withMessage('User ID required'),
			],
			checkValidation,
			usersController.getUserById,
		],
		(req, res, next) => {
			return res.status(200).send(res.locals.userData);
		}
	);

// Create new user
// Moved to auth controller
// router.route('/').post(
// 	[
// 		[
// 			check('name')
// 				.notEmpty()
// 				.withMessage('User name required')
// 				.isLength({ max: 40 }),
// 			check('gold')
// 				.optional()
// 				.isInt()
// 				.withMessage('Gold must be an integer number'),
// 			// TODO: Will user model need to store auth data? How to determine which user belongs to which real-world google/email account?
// 		],
// 		checkValidation,
// 		authController.
// 		usersController.createUser,

// 		// If no authentication was provided (i.e. "sign in as guest"),
// 		// delete the user after a certain amount of time
// 		(req, res, next) => {
// 			if (!res.locals.authResult) scheduleUserDeletion(req, res, next);
// 			else next();
// 		},
// 	],
// 	(req, res) => {
// 		return res.status(200).send({
// 			message: res.locals.authResult
// 				? 'Successfully created user.'
// 				: 'Successfully created guest user. (Expires in 1 hour)',
// 			userId: res.locals.userId,
// 			user: res.locals.userData,
// 		});
// 	}
// );

// Get all inventory items
// Not a privileged action? Should be able to see everyone's inventory
router
	.route('/:userId/inv/')
	.get([usersController.getInventoryContents], (req, res) => {
		return res.status(200).send(res.locals.inventory);
	});

// Get inventory item by Id
router
	.route('/:userId/inv/:invItemId')
	.get([usersController.getInventoryItemById], (req, res) => {
		return res.status(200).send(res.locals.invItemResult);
	});

// Add item to inventory
router.route('/:userId/inv/:itemId').post(
	[
		// Authenticate
		usersController.getUserById,
		authController.verifyUserToken,
		usersController.userMatchesFirebaseUserUid,

		itemsController.getItemById, // Verify item exists
		usersController.addItemToInventory,
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
		// Authenticate
		usersController.getUserById,
		authController.verifyUserToken,
		usersController.userMatchesFirebaseUserUid,

		usersController.getInventoryItemById,
		async (req, res, next) => {
			// Unequip item if ID matches
			const equipmentType =
				res.locals.invItemResult.item.equipmentType
					.charAt(0)
					.toLowerCase() +
				res.locals.invItemResult.item.equipmentType.slice(1);
			if (
				res.locals.invItemResult.documentId ===
				res.locals.userData.equippedItems[equipmentType]
			) {
				console.log('Item was equipped. Unequipping...');
				req.params.slot = equipmentType;
				usersController.unequipItem(req, res, next);
			} else next();
		},
		usersController.removeItemFromInventory,
	],
	(req, res) => {
		return res.status(200).send({
			message: `Item with ID ${req.params.invItemId} deleted successfully`,
		});
	}
);

// Get all equipped items
router
	.route('/:userId/inv/equipped/all')
	.get(
		[usersController.getUserById, usersController.getInventoryContents],
		(req, res) => {
			let equippedItems = [];
			Object.values(res.locals.userData.equippedItems).forEach(
				(equippedItemId) => {
					if (equippedItemId !== '')
						equippedItems.push(
							res.locals.inventory.filter((i) => {
								return i.documentId === equippedItemId;
							})
						);
				}
			);
			return res.status(200).send(equippedItems);
		}
	);

// Get single equipped item
router.route('/:userId/inv/equipped/:slot').get(
	[
		[
			param('slot')
				.isIn(Object.keys(EquipmentType))
				.withMessage(
					`slot must be one of the following options: ${Object.keys(
						EquipmentType
					).toString()}`
				),
		],
		checkValidation,
		usersController.getUserById,
		usersController.getInventoryContents,
	],
	(req, res) => {
		let equippedItem = {};
		const equippedItemId =
			res.locals.userData.equippedItems[req.params.slot];
		if (equippedItemId !== '')
			equippedItem = res.locals.inventory.filter((i) => {
				return i.documentId === equippedItemId;
			})[0];
		return res
			.status(equippedItem.documentId ? 200 : 404)
			.send(equippedItem);
	}
);

// Equip item
router.route('/:userId/inv/equip/:invItemId').post(
	[
		// TODO: Validation rules - verify that equip slot begins with lowercase and matches one of equipment slot fields
		// Authenticate
		usersController.getUserById,
		authController.verifyUserToken,
		usersController.userMatchesFirebaseUserUid,

		usersController.getInventoryItemById,
		usersController.equipItem,
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
		// Authenticate
		usersController.getUserById,
		authController.verifyUserToken,
		usersController.userMatchesFirebaseUserUid,

		usersController.unequipItem,
	],
	(req, res) => {
		return res.status(200).send({
			message: `Unequipped ${req.params.slot}`,
		});
	}
);

// Purchase item
router.route('/:userId/inv/buy/:itemId').post(
	[
		// TODO: Itemcontroller: get item by ID so we can attach it to result body
		itemsController.getItemById,
		
		// Authenticate
		usersController.getUserById,
		authController.verifyUserToken,
		usersController.userMatchesFirebaseUserUid,

		(req, res, next) => {
			res.locals.transactionAmount = -res.locals.item.goldValue;
			if (res.locals.transactionAmount > 0)
				res.locals.transactionAmount *= -1;
			next();
		},
		usersController.performGoldTransaction,
		usersController.addItemToInventory,
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
