// Imports
const { doc, setDoc } = require('firebase/firestore');
const userModel = require('../models/users.model.js');

// Validation rules
const vr_getUser = {};
const vr_addItemToInventory = {};
const vr_removeItemFromInventory = {};
const vr_equipItem = {};

// Route endpoints
const createUser = async function (req, res) {
	// Req contents: name
	const ref = doc(fb_db, 'users', req.userID).withConverter(
		userModel.userConverter
	);
	await setDoc(ref, new userModel.User(req.userName));
	res.send("Yup!");
};

const getUser = (req, res) => {};

const addItemToInventory = (req, res) => {
	// Req contents: Item ID
	// Create InventoryItem
	// Append to inventory
	//  - Will inventory field be necessary? Can just get all inventory items with userID
	//  - Firebase isn't relational? Research further
};

const removeItemFromInventory = (req, res) => {
	// Req contents: InventoryItem ID (or item ID?)
	// Find and delete InventoryItem with matching ID
};

const equipItem = (req, res) => {
	// Req contents: InventoryItem ID
	//
};
