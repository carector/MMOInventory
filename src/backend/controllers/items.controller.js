// #region Imports
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
	itemConverter,
	convertToSubclass
} = require('../models/items.model.js');
const { toBool } = require('../common.js');
// #endregion

// sanitize item further? (done already by item class constructor)

// #region Middleware functions
const getItemById = async function (req, res, next) {
	const db = getDb();
	try {
		const itemCatalogRef = await collection(db, 'itemCatalog');
		const result = await getDoc(doc(itemCatalogRef, req.params.itemId));
		if (result.exists()) {
			res.locals.item = result.data();
			next();
		} else
			return res.status(404).send({
				error: `Item with ID ${req.params.itemId} not found`,
			});
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const getAllItems = async function (req, res, next) {
	// TODO: React-style pagination
	const db = getDb();
	try {
		const querySnapshot = await getDocs(collection(db, 'itemCatalog'));
		const includeDisabled = toBool(req.body.includeDisabledItems);
		let items = [];
		querySnapshot.forEach((doc) => {
			if (!(doc.data().disabledGlobally && !includeDisabled))
				items.push({ documentId: doc.id, ...doc.data() });
		});
		res.locals.items = items;
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const createItem = async function (req, res, next) {
	// TODO
	// Require admin auth
	const db = getDb();
	try {
		const ref = collection(db, 'itemCatalog');
		console.log(req.body);
		const u = itemConverter.toFirestore(convertToSubclass(req.body));
		const result = await addDoc(ref, u);
		res.locals.item = u;
		res.locals.itemId = result.id;
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

// Allows admins to disable a certain item game-wide
// Useful for items / equipment that may be causing bugs or balance issues
const enableDisableItemGlobally = async function (req, res, next) {
	const db = getDb();
	try {
		const ref = doc(db, 'itemCatalog', req.params.itemId);
		const result = await updateDoc(ref, {
			disabledGlobally: toBool(req.body.disabled),
		});
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const deleteItemById = async function (req, res, next) {
	const db = getDb();
	try {
		const itemCatalogRef = await collection(db, 'itemCatalog');
		const result = await deleteDoc(doc(itemCatalogRef, req.params.itemId));
		next();
	} catch (e) {
		console.error(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const importItemsFromJSON = async function (req, res) {
	// TODO
	// Validate json array of items
	// - Return errors if present
	// Create items in DB for each item in JSON

	// const db = getDb();
	// try {
	// 	const items = req.body.items;
	// 	const batch = writeBatch(db);
	// 	const ref = collection(db, 'itemCatalog');

	// 	items.forEach((item) => {
	// 		const u = itemConverter.toFirestore(convertToSubclass(item));
	// 		// Need to generate doc ID - 'set' doesn't create one
	// 		console.log(u);
	// 		batch.set(ref, u);
	// 	})

	// 	const result = await batch.commit();
	// 	console.log("Committed?");
	// 	return res.status(200).send({
	// 		message: 'Successfully created items.',
	// 		items: result.data()
	// 	});
	// } catch (e) {
	// 	console.error(e);
	// 	return res.status(400).send(`Error: ${e}`);
	// }
};
// #endregion


module.exports = {
	getItemById,
	getAllItems,
	createItem,
	enableDisableItemGlobally,
	deleteItemById,
	importItemsFromJSON,
};
