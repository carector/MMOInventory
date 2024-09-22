// #region Imports
const express = require('express');
const { check, param, body } = require('express-validator');

// Local imports
const itemsController = require('../controllers/items.controller.js');
const { checkValidation } = require('../common.js');
const {
	Item,
	ItemType,
	EquipmentType,
} = require('../models/items.model.js');
// #endregion

// #region Routes
const router = express.Router();

// Health endpoint
router.route('/health').get((req, res) => res.send('Item catalog'));

// Get all items in database
router.route('/').get(
	[
		itemsController.getAllItems
	],
	(req, res) => {
		return res.status(200).send(res.locals.items);
	}
);

// Get item by Id
router
	.route('/:itemId')
	.get(
		[
			param('itemId').exists().notEmpty().withMessage('Item ID required'),
			checkValidation,
			itemsController.getItemById
		],
		(req, res) => {
			return res.status(200).send(res.locals.item);
		}
	);

// Create item
router
	.route('/')
	.post(
		[
			// TODO: Authenticate admin
			[
				check('baseItemName')
					.exists()
					.notEmpty()
					.withMessage('Item name required')
					.isLength({ max: 40 }),
				check('description')
					.optional()
					.isLength({ max: 256 })
					.withMessage('Description must be under 256 characters long'),
				check('itemType')
					.exists()
					.withMessage('Item type required')
					.isIn(Object.keys(ItemType))
					.withMessage(
						`itemType must be one of the following options: ${Object.keys(
							ItemType
						).toString()}`
					),
				check('equipmentType')
					.if(body('itemType').isIn(['Equipment']))
					.exists()
					.withMessage('equipmentType required')
					.isIn(Object.keys(EquipmentType))
					.withMessage(
						`equipmentType must be one of the following options: ${Object.keys(
							EquipmentType
						).toString()}`
					),
				check('stackable')	// TODO: Disable stacking for equipment?
					.optional()
					.isBoolean()
					.withMessage('Stackable must either be true or false'),
				check('goldValue')
						.optional()
						.isInt()
						.withMessage('Gold value must be an integer number')
			], 
			checkValidation,
			itemsController.createItem
		],
		(req, res) => {
			return res.status(200).send({
				message: 'Successfully created item.',
				itemId: res.locals.itemId,
				item: res.locals.item,
			});
		}
	);

// Import and create items from JSON
router
	.route('/import')
	.post(
		(req, res) => {
			res.status(400).send("TODO");
		}
	);

router
	.route('/updateDisabledState/:itemId')
	.patch(
		[
			// TODO: Authenticate admin
			[
				param('itemId').exists().notEmpty().withMessage('Item ID required'),
				check('disabled')
					.exists()
					.withMessage('Disabled state required')
					.isBoolean()
					.withMessage('Disabled must be a true/false value'),
			],
			checkValidation,
			itemsController.getItemById,
			itemsController.enableDisableItemGlobally
		],
		(req, res) => {
			return res.status(200).send({
				message: 'Successfully updated global enabled/disabled state.'
			});
		}
	);

// Delete item
router
	.route('/:itemId')
	.delete(
		[
			// TODO: Admin authentication
			// TODO: (USER CONTROLLER): Add inventory validation middleware that checks if any items in inventory were deleted
			[
				param('itemId').exists().notEmpty().withMessage('Item ID required') // Necessary?
			], 
			checkValidation,
			itemsController.deleteItemById
		],
		(req, res) => {
			return res.status(200).send({
				message: `Item with ID ${req.params.itemId} deleted successfully`,
			});
		}
	);

// #endregion

module.exports = router;
