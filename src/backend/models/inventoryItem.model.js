// Model
// Metadata for an item that is placed in a user's inventory
class InventoryItem {
	constructor(data) {
		this.itemPath = data.itemPath;								// Reference ID of the actual item
		this.ownerId = data.ownerId;								// ID of the user who owns this item
		//this.equipped = data?.equipped || false;					// Whether this item is equipped (TODO: equipment subclass)
		this.quantity = data?.quantity || 1;						// How many of this item are owned on this item slot
		this.dateObtained = data?.dateObtained || new Date();		// The date the item was added to the inventory
	}
}

// Firestore data converter
const inventoryItemConverter = {
	toFirestore: (inventoryItem) => {
		return {
			itemPath: inventoryItem.itemPath,
			ownerId: inventoryItem.ownerId,
			//equipped: inventoryItem.equipped,		User equippedItems field replaces this
			quantity: inventoryItem.quantity,
			dateObtained: inventoryItem.dateObtained,
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return new InventoryItem(data);
	},
};

module.exports = {InventoryItem, inventoryItemConverter}