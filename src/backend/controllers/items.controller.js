// Imports
const { check, param } = require('express-validator');
const {
	doc,
	setDoc,
	getDoc,
	getDocs,
	updateDoc,
	collection,
	addDoc,
} = require('firebase/firestore');

const { db } = require('../fb.js');
const { Item, itemConverter } = require('../models/items.model.js');
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
	check('stackable')
        .optional()
		.isBoolean()
		.withMessage('Stackable must either be true or false'),
];

const vr_enableDisableItemGlobally = [
	param('itemID').exists().notEmpty().withMessage('Item ID required'),
	check('disabled')
		.exists()
		.withMessage('Disabled state required')
		.isBoolean()
		.withMessage('Disabled must be a true/false value'),
];

// Route endpoints
const getItemByID = async function (req, res) {
	try {
		const itemCatalogRef = await collection(db, 'itemCatalog');
		const result = await getDoc(doc(itemCatalogRef, req.params.itemID));
		if (result.exists()) {
			return res.status(200).send(result.data());
		} else
			return res.status(404).send({
				message: `Item with ID ${req.params.itemID} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getAllItems = async function (req, res) {
	try {
		const querySnapshot = await getDocs(collection(db, 'itemCatalog'));
        const includeDisabled = toBool(req.body.includeDisabledItems)
		let items = [];
		querySnapshot.forEach((doc) => {
            if(!(doc.data().disabledGlobally && !includeDisabled))
			    items.push({ documentId: doc.id, ...doc.data() });
		});
		return res.status(200).send(items);
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const createItem = async function (req, res) {
	try {
		const ref = collection(db, 'itemCatalog');
		const u = itemConverter.toFirestore(new Item(req.body));
		console.log(u);
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

const enableDisableItemGlobally = async function (req, res) {
	try {
		const ref = doc(db, 'itemCatalog', req.params.itemID);
		const result = await updateDoc(ref, {
			disabledGlobally: toBool(req.body.disabled),
		});
        console.log(result)
		return res.status(200).send({
			message: 'Successfully updated global enabled/disabled state.',
			result: result
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

	getItemByID,
	getAllItems,
	createItem,
	enableDisableItemGlobally,
};
