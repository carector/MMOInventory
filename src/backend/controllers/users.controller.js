// #region Imports
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
// #endregion

// #region Validation rules
// TODO: Move validation rules to route file
const vr_createUser = [
	check('name')
		.notEmpty()
		.withMessage('User name required')
		.isLength({ max: 40 }),
];

const vr_getUserById = [
	param('userId').exists().notEmpty().withMessage('User ID required'),
];
const vr_addItemToInventory = [];
const vr_removeItemFromInventory = [];
const vr_equipItem = [];
// #endregion


// #region Middleware functions
const getInventoryItemIdFromIndex = async function (req, res, next) {};
const verifyInventoryItemExists = async function (req, res, next) {
	const db = getDb();
	const userId = req.params.userId;
	try {
		const itemCatalogRef = await collection(db, 'inventoryItems');
		const result = await getDoc(doc(itemCatalogRef, req.params.invItemId)); // TODO: Near-identical to getInventoryItem, consolidate into one fcn
		if (result.exists()) {
			// Make sure current user owns this item
			if (result.data().ownerId !== userId)
				return res.status(401).send({
					error: `Inventory item with ID ${req.params.invItemId} not owned by user with ID ${userId}`,
				});
			next();
		} else
			return res.status(404).send({
				error: `Inventory item with ID ${req.params.invItemId} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getUserById = async function (req, res, next) {
	const db = getDb();
	try {
		// Get user from firestore
		const usersRef = await collection(db, 'users');
		const result = await getDoc(doc(usersRef, req.params.userId));
		if (result.exists()) {
			res.locals.userData = result.data();
			return next();
		} else
			return res.status(404).send({
				error: `User with ID ${req.params.userId} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const sanitizeUser = async function (req, res, next) {
	const db = getDb();
	try {
		// Get user from firestore
		const usersRef = await collection(db, 'users');
		const docRef = await doc(usersRef, req.params.userId);
		const result = await getDoc(docRef);
		if (!result.exists()) {
			return res.status(404).send({
				error: `User with ID ${req.params.userId} not found`,
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

const hasEnoughGold = async function(req, res, next) {
	const db = getDb();
	if(!res.locals.userData) {
		
	}
	else
		return res.status(400).send(`Error: userData not present in response locals (are you missing a middleware call?)`);
	next();
}

const createUser = async function (req, res, next) {
	const db = getDb();
	try {
		// Req contents: name
		const ref = collection(db, 'users');
		const u = userConverter.toFirestore(new User(req.body));
		const result = await addDoc(ref, u);
		res.locals.userData = u;
		res.locals.userId = result.id;
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getAllUsers = async function (req, res, next) {
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

const getInventoryContents = async function (req, res, next) {
	const db = getDb();
	try {
		// Get user
		const usersRef = collection(db, 'users');
		const result = await getDoc(doc(usersRef, req.params.userId));
		if (!result.exists()) {
			return res.status(404).send({
				error: `User with ID ${req.params.userId} not found`,
			});
		}

		// Return early if inventory is empty
		if(result.data().inventory.length === 0) {
			res.locals.inventory = [];
			return next();
		}

		// Get each inventory item
		let invItems = [];
		let items = [];
		const q1 = query(
			collection(db, 'inventoryItems'),
			where(documentId(), 'in', result.data().inventory)
		);
		const q1Snapshot = await getDocs(q1);
		q1Snapshot.forEach((doc) => {
			invItems.push({ documentId: doc.id, ...doc.data() });
			items.push(doc.data().itemPath.split('/')[1]);
		});

		// Get item data for each inventory item
		const q2 = query(
			collection(db, 'itemCatalog'),
			where(documentId(), 'in', items)
		);
		const q2Snapshot = await getDocs(q2);
		q2Snapshot.forEach((doc) => {
			invItems
				.filter((i) => i.itemPath.includes(doc.id))
				.forEach((invItem) => {
					invItem.item = doc.data();
				});
		});
		res.locals.inventory = invItems;
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getInventoryItemById = async function (req, res, next) {
	const db = getDb();
	try {
		// Get inv item from firestore
		const itemsRef = await collection(db, 'inventoryItems');
		const result = await getDoc(doc(itemsRef, req.params.invItemId));
		if (result.exists()) {
			// Get actual item data
			const itemResult = await getDoc(doc(db, result.data().itemPath));
			const ret = {
				documentId: result.id,
				...result.data(),
				item: itemResult.data(),
			};
			res.locals.invItemResult = ret;
			next();
		} else
			return res.status(404).send({
				error: `Inventory item with Id ${req.params.invItemId} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

// prereq: item exists
const addItemToInventory = async function (req, res, next) {
	const db = getDb();
	try {
		// Create inventoryItem
		const data = {
			itemPath: `itemCatalog/${req.params.itemId}`,
			ownerId: req.params.userId,
			quantity: req.body.quantity,
		};
		const item = inventoryItemConverter.toFirestore(
			new InventoryItem(data)
		);
		const ref = collection(db, 'inventoryItems');
		const result = await addDoc(ref, item);

		// Update inventory
		const docRef = doc(collection(db, 'users'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			inventory: arrayUnion(result.id),
		});
		res.locals.invItemId = result.id;
		res.locals.invItem = item;
		next();
		
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const removeItemFromInventory = async function (req, res, next) {
	const db = getDb();
	try {
		// Remove reference from inventory
		// TODO: Remove from equipped items if equipped
		const invItemId = req.params.invItemId;
		const docRef = doc(collection(db, 'users'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			inventory: arrayRemove(invItemId),
		});

		// Delete inventory item
		const ref = collection(db, 'inventoryItems');
		const result = await deleteDoc(doc(ref, invItemId));
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const equipItem = async function (req, res, next) {
	// Req contents: InventoryItem ID
	// prereq: confirm item is an equipment
	const db = getDb();
	try {
		let slots = res.locals.userData.equippedItems;
		slots[req.body.slot] = req.params.invItemId;
		
		const docRef = doc(collection(db, 'users'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			equippedItems: slots
		});
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}

};

const getEquippedItems = async function(req, res, next) {
	// Stored as array of invitem IDs
	res.send('TODO');
	
};


const unequipItem = async function(req, res, next) {
	// Takes item slot as only input
	const db = getDb();
	try {
		let slots = res.locals.userData.equippedItems;
		const equipped = slots[req.params.slot];
		if(equipped === '')
			return res.status(200).send({
				message: `No item equipped to ${req.params.slot}`,
			});

		slots[req.params.slot] = '';
		
		const docRef = doc(collection(db, 'users'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			equippedItems: slots
		});
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
}

const increaseGold = async function(req, res) {

}
const decreaseGold = async function(req, res) {}

// #endregion

module.exports = {
	vr_createUser,
	vr_getUserById,

	sanitizeUser,
	verifyInventoryItemExists,
	getUserById,

	createUser,
	getAllUsers,

	addItemToInventory,
	getInventoryContents,
	getInventoryItemById,
	removeItemFromInventory,
	equipItem,
	getEquippedItems,
	unequipItem,
	increaseGold,
	decreaseGold
};
