// Imports
const { check, param, body } = require('express-validator');
const {
	doc,
	getDoc,
	getDocs,
	deleteDoc,
	updateDoc,
	collection,
	addDoc,
	writeBatch
} = require('firebase/firestore');

const { getDb } = require('../fb.js');
const {
	Item,
	ItemType,
	EquipmentType,
	itemConverter,
	convertToSubclass
} = require('../models/items.model.js');
const { toBool } = require('../common.js');

// Request body validation rules
const vr_getItemByID = [
	param('itemID').exists().notEmpty().withMessage('Item ID required'),
];

const vr_createItem = [
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
];

const vr_enableDisableItemGlobally = [
	param('itemID').exists().notEmpty().withMessage('Item ID required'),
	check('disabled')
		.exists()
		.withMessage('Disabled state required')
		.isBoolean()
		.withMessage('Disabled must be a true/false value'),
];

const vr_deleteItemByID = [
	param('itemID').exists().notEmpty().withMessage('Item ID required'),
];

// Middleware
// sanitize item further? (done already by item class constructor)
// 

// Route endpoints
const getItemByID = async function (req, res) {
	const db = getDb();
	try {
		const itemCatalogRef = await collection(db, 'itemCatalog');
		const result = await getDoc(doc(itemCatalogRef, req.params.itemID));
		if (result.exists()) {
			return res.status(200).send(result.data());
		} else
			return res.status(404).send({
				error: `Item with ID ${req.params.itemID} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getAllItems = async function (req, res) {
	const db = getDb();
	try {
		const querySnapshot = await getDocs(collection(db, 'itemCatalog'));
		const includeDisabled = toBool(req.body.includeDisabledItems);
		let items = [];
		querySnapshot.forEach((doc) => {
			if (!(doc.data().disabledGlobally && !includeDisabled))
				items.push({ documentId: doc.id, ...doc.data() });
		});
		return res.status(200).send(items);
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const createItem = async function (req, res) {
	// TODO
	// Require admin auth
	const db = getDb();
	try {
		const ref = collection(db, 'itemCatalog');
		console.log(req.body);
		const u = itemConverter.toFirestore(convertToSubclass(req.body));
		const result = await addDoc(ref, u);	
		return res.status(200).send({
			message: 'Successfully created item.',
			itemId: result.id,
			item: u,
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

// Allows admins to disable a certain item game-wide
// Useful for items / equipment that may be causing bugs or balance issues
const enableDisableItemGlobally = async function (req, res) {
	// TODO
	// Require admin auth
	const db = getDb();
	try {
		const ref = doc(db, 'itemCatalog', req.params.itemID);
		const result = await updateDoc(ref, {
			disabledGlobally: toBool(req.body.disabled),
		});
		return res.status(200).send({
			message: 'Successfully updated global enabled/disabled state.',
			result: result,
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const deleteItemByID = async function (req, res) {
	// TODO
	// Require admin auth
	const db = getDb();
	try {
		const itemCatalogRef = await collection(db, 'itemCatalog');
		const result = await deleteDoc(doc(itemCatalogRef, req.params.itemID));
		return res.status(200).send({
			message: `Item with ID ${req.params.itemID} deleted successfully`,
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const importItemsFromJSON = async function (req, res) {
	// TODO
	// Requires admin auth
	// Validate json array of items
	// - Return errors if present
	// Create items in DB for each item in JSON

	const db = getDb();
	try {
		const items = req.body.items;
		const batch = writeBatch(db);
		const ref = collection(db, 'itemCatalog');

		items.forEach((item) => {
			const u = itemConverter.toFirestore(convertToSubclass(item));
			// Need to generate doc ID - 'set' doesn't create one
			console.log(u);
			batch.set(ref, u);
		})

		const result = await batch.commit();
		console.log("Committed?");
		return res.status(200).send({
			message: 'Successfully created items.',
			items: result.data()
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

module.exports = {
	vr_getItemByID,
	vr_createItem,
	vr_enableDisableItemGlobally,
	vr_deleteItemByID,

	mw_verifyItemExists,

	getItemByID,
	getAllItems,
	createItem,
	enableDisableItemGlobally,
	deleteItemByID,
	importItemsFromJSON,
};
