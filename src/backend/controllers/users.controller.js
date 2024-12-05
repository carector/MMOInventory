// #region Imports
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
	increment,
} = require('firebase/firestore');
const { userConverter, User } = require('../models/users.model.js');
const {
	inventoryItemConverter,
	InventoryItem,
} = require('../models/inventoryItem.model.js');
const { getDb } = require('../fb.js');
const { FirebaseError } = require('firebase/app');
// #endregion

// #region Middleware functions
const getInventoryItemIdFromIndex = async function (req, res, next) {};
// const verifyInventoryItemExists = async function (req, res, next) {};

const getUserByUid = async function (req, res, next) {
	const db = getDb();
	try {
		// Get user from firestore
		const usersRef = await collection(db, 'userData');
		const q = query(usersRef, where("uid", "==", req.params.userId));
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
		const usersRef = await collection(db, 'userData');
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

const userMatchesFirebaseUserUid = async function(req, res, next) {
	const firebaseUid = res.locals.authUserResult.uid;
	const userId = req.params.userId;
	if(firebaseUid === userId)
		next();
	else
		return res.status(400).send({error: "User ID does not match logged in user"});

}

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
		const authUid = res.locals.authUserResult.uid;	// TODO: Find solution for guest accounts
		console.log(authUid);
		const data = userConverter.toFirestore(new User({...req.body, uid: authUid ? authUid : null}));
		const result = await setDoc(doc(db, `userData/${authUid}`), data);
		res.locals.userData = data;
		res.locals.userId = authUid;
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const scheduleUserDeletion = async function (req, res, next) {
	
}

const getAllUsers = async function (req, res, next) {
	const db = getDb();
	try {
		const querySnapshot = await getDocs(collection(db, 'userData'));
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
		const usersRef = collection(db, 'userData');
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
				error: `Inventory item with ID ${req.params.invItemId} not found`,
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
		const docRef = doc(collection(db, 'userData'), req.params.userId);
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
		const docRef = doc(collection(db, 'userData'), req.params.userId);
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
		
		const docRef = doc(collection(db, 'userData'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			equippedItems: slots
		});
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}

};


const unequipItem = async function(req, res, next) {
	// Takes item slot as only input
	const db = getDb();
	try {
		let slots = res.locals.userData.equippedItems;
		const equipped = slots[req.params.slot];
		if(equipped === '') {
			console.log(`No item equipped to ${equipped}`);
			return next(); //return res.status(400).send({message: `No item equipped to ${req.params.slot}`,});
		}

		slots[req.params.slot] = '';
		
		const docRef = doc(collection(db, 'userData'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			equippedItems: slots
		});
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
}

const performGoldTransaction = async function(req, res, next) {
	if(!res.locals.transactionAmount || res.locals.userData?.gold === undefined)
		return res.status(428).send({error: 'Middleware preconditions not satisfied'});

	if(res.locals.userData.gold + res.locals.transactionAmount < 0)
		return res.status(400).send({error: `Insufficient funds: ${-res.locals.transactionAmount} gold required but user only had ${res.locals.userData.gold}`});

	const db = getDb();
	try {		
		const docRef = doc(collection(db, 'userData'), req.params.userId);
		const querySnapshot = await updateDoc(docRef, {
			gold: increment(res.locals.transactionAmount)
		});
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
}

// #endregion

module.exports = {
	sanitizeUser,
	getUserById: getUserByUid,
	createUser,
	getAllUsers,
	addItemToInventory,
	getInventoryContents,
	getInventoryItemById,
	removeItemFromInventory,
	equipItem,
	unequipItem,
	performGoldTransaction,
	userMatchesFirebaseUserUid,
};
