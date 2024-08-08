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
const { db } = require('../fb.js');
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

// Route endpoints
const createUser = async function (req, res) {
	console.log('- TEST ADD - ');
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
	try {
		// Get user from firestore
		const usersRef = await collection(db, 'users');
		const result = await getDoc(doc(usersRef, req.params.userID));
		if (result.exists()) {
			return res.status(200).send(result.data());
		} else
			return res
				.status(404)
				.send({message: `User with ID ${req.params.userID} not found`});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getAllUsers = async function (req, res) {
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

const addItemToInventory = (req, res) => {
	res.send('TODO');

	// Req contents: Item ID
	// Create InventoryItem
	// Append to inventory
	//  - Will inventory field be necessary? Can just get all inventory items with userID
	//  - Firebase isn't relational? Research further
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
};
