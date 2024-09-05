// Imports
const { check, param } = require('express-validator');
const {
	doc,
	setDoc,
	getDoc,
	getDocs,
	collection,
	addDoc,
	updateDoc,
	arrayUnion,
	deleteDoc,
	arrayRemove,
	query,
	where,
	documentId,
} = require('firebase/firestore');
const { userConverter, User } = require('../models/users.model.js');
const {
	inventoryItemConverter,
	InventoryItem,
} = require('../models/inventoryItem.model.js');
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
const mw_getInventoryItemIdFromIndex = async function (req, res, next) {};
const mw_verifyInventoryItemExists = async function (req, res, next) {
	const db = getDb();
	const userId = req.params.userID;
	try {
		const itemCatalogRef = await collection(db, 'inventoryItems');
		const result = await getDoc(doc(itemCatalogRef, req.params.invItemID));
		if (result.exists()) {
			// Make sure current user owns this item
			if (result.data().ownerId !== userId)
				return res.status(401).send({
					error: `Inventory item with ID ${req.params.invItemID} not owned by user with ID ${userId}`,
				});
			next();
		} else
			return res.status(404).send({
				error: `Inventory item with ID ${req.params.invItemID} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const mw_sanitizeUser = async function (req, res, next) {
	const db = getDb();
	try {
		// Get user from firestore
		const usersRef = await collection(db, 'users');
		const docRef = await doc(usersRef, req.params.userID);
		const result = await getDoc(docRef);
		if (!result.exists()) {
			return res.status(404).send({
				error: `User with ID ${req.params.userID} not found`,
			});
		}

		// Add any missing fields and delete any that shouldn't be there
		const sanitizedUser = userConverter.toFirestore(
			new User(result.data())
		);
		//await updateDoc(docRef, sanitizedUser);
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

// Route endpoints
const createUser = async function (req, res) {
	const db = getDb();
	try {
		// Req contents: name
		const ref = collection(db, 'users');
		const u = userConverter.toFirestore(new User(req.body));
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
			return res.status(404).send({
				error: `User with ID ${req.params.userID} not found`,
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

const getInventoryContents = async function (req, res) {
	const db = getDb();
	try {
		// Get user
		const usersRef = await collection(db, 'users');
		const result = await getDoc(doc(usersRef, req.params.userID));
		if (!result.exists()) {
			return res.status(404).send({
				error: `User with ID ${req.params.userID} not found`,
			});
		}
		console.log(result.data().inventory);
		// Get each inventory item
		let items = [];
		const q = query(
			collection(db, 'inventoryItems'),
			where(documentId(), 'in', result.data().inventory)
		);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((doc) => {
			items.push(doc);
			console.log(doc.id);
		});
		return res.status(200).send(items);
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getInventoryItemById = async function (req, res) {
	const db = getDb();
	try {
		// Get user from firestore
		const itemsRef = await collection(db, 'inventoryItems');
		const result = await getDoc(doc(itemsRef, req.params.invItemID));
		if (result.exists()) {
			return res.status(200).send(result.data());
		} else
			return res.status(404).send({
				error: `Inventory item with ID ${req.params.invItemID} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

// prereq: item exists
const addItemToInventory = async function (req, res) {
	const db = getDb();
	try {
		// Create inventoryItem
		const data = {
			itemPath: `itemCatalog/${req.params.itemID}`,
			ownerId: req.params.userID,
			quantity: req.body.quantity,
		};
		const item = inventoryItemConverter.toFirestore(
			new InventoryItem(data)
		);
		const ref = collection(db, 'inventoryItems');
		const result = await addDoc(ref, item);

		// Update inventory
		const docRef = doc(collection(db, 'users'), req.params.userID);
		const querySnapshot = await updateDoc(docRef, {
			inventory: arrayUnion(result.id),
		});

		return res.status(200).send({
			message: 'Successfully added item to inventory.',
			inventoryItemId: result.id,
			inventoryItem: item,
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const removeItemFromInventory = async function (req, res) {
	const db = getDb();
	try {
		// Remove reference from inventory
		const invItemId = req.params.invItemID;
		const docRef = doc(collection(db, 'users'), req.params.userID);
		const querySnapshot = await updateDoc(docRef, {
			inventory: arrayRemove(invItemId),
		});

		// Delete inventory item
		const ref = collection(db, 'inventoryItems');
		const result = await deleteDoc(doc(ref, invItemId));
		return res.status(200).send({
			message: `Item with ID ${invItemId} deleted successfully`,
		});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const equipItem = (req, res) => {
	res.send('TODO');

	// Req contents: InventoryItem ID
	//
};

module.exports = {
	vr_createUser,
	vr_getUserByID,

	mw_sanitizeUser,
	mw_verifyInventoryItemExists,

	createUser,
	getUserByID,
	getAllUsers,

	addItemToInventory,
	getInventoryContents,
	getInventoryItemById,
	removeItemFromInventory,
};
