// Imports
const express = require('express');
const { checkValidation } = require('../common.js');

// Local imports
const itemsController = require('../controllers/items.controller.js');

// Definitions
const router = express.Router();

// Routes
router.route('/health').get((req, res) => res.send('Item catalog'));
router.route('/').get(itemsController.getAllItems);
router
	.route('/:itemID')
	.get(
		[itemsController.vr_getItemByID, checkValidation],
		itemsController.getItemByID
	);

router
	.route('/')
	.post(
		[itemsController.vr_createItem, checkValidation],
		itemsController.createItem
	);

router
	.route('/updateDisabledState/:itemID')
	.patch(
		[itemsController.vr_enableDisableItemGlobally, checkValidation],
		itemsController.enableDisableItemGlobally
	);

router
	.route('/:itemID')
	.delete(
		[itemsController.vr_deleteItemByID, checkValidation],
		itemsController.deleteItemByID
	);

module.exports = router;
