// Imports
const { check, param } = require('express-validator');
const {
	doc,
	setDoc,
	getDoc,
	getDocs,
	collection,
	addDoc,
} = require('firebase/firestore');
const { userConverter, User } = require('../models/users.model.js');
const {
	inventoryItemConverter,
	InventoryItem,
} = require('../models/inventoryitem.model.js');
const { getDb } = require('../fb.js');
const { FirebaseError } = require('firebase/app');

// Request body validation rules
const vr_createUser = [
	check('name')
		.notEmpty()
		.withMessage('User name required')
		.isLength({ max: 40 }),
];
const vr_getUserByID = [
	param('userID').exists().notEmpty().withMessage('User ID required'),
];
const vr_addItemToInventory = [];
const vr_removeItemFromInventory = [];
const vr_equipItem = [];

// Middleware functions
const mw_authenticateUser = async function (req, res, next) {};

// Route endpoints
const createUser = async function (req, res) {
	console.log('- TEST ADD - ');
	const db = getDb();
	try {
		// Req contents: name
		const ref = collection(db, 'users');
		const u = userConverter.toFirestore(new User(req.body));
		console.log(u);
		const result = await addDoc(ref, u);
		return res.status(200).send({
			message: 'Successfully created user.',
			userId: result.id,
			user: u,
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getUserByID = async function (req, res) {
	const db = getDb();
	try {
		// Get user from firestore
		const usersRef = await collection(db, 'users');
		const result = await getDoc(doc(usersRef, req.params.userID));
		if (result.exists()) {
			return res.status(200).send(result.data());
		} else
			return res
				.status(404)
				.send({
					message: `User with ID ${req.params.userID} not found`,
				});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getAllUsers = async function (req, res) {
	const db = getDb();
	try {
		const querySnapshot = await getDocs(collection(db, 'users'));
		let users = [];
		querySnapshot.forEach((doc) => {
			users.push({ documentId: doc.id, ...doc.data() });
		});
		return res.status(200).send(users);
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

// prereq: item exists
const addItemToInventory = (req, res) => {
	// Req fields
	// - quantity (if missing, 1)
	// - param: item ID (check if item is valid during middleware step?)

	const invItem = new InventoryItem(req.body);
	console.log(inventoryItemConverter.toFirestore(invItem));
	res.send('TODO');
};

const removeItemFromInventory = (req, res) => {
	res.send('TODO');

	// Req contents: InventoryItem ID (or item ID?)
	// Find and delete InventoryItem with matching ID
};

const equipItem = (req, res) => {
	res.send('TODO');

	// Req contents: InventoryItem ID
	//
};

module.exports = {
	vr_createUser,
	vr_getUserByID,

	createUser,
	getUserByID,
	getAllUsers,
	addItemToInventory,
};
