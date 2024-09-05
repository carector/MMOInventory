// Model
class InventoryItem {
	constructor(data) {
		this.itemPath = data.itemPath;
		this.equipped = data?.equipped || false;
		this.quantity = data?.quantity || 1;
		this.dateObtained = data?.dateObtained || new Date();
	}
}

// Firestore data converter
const inventoryItemConverter = {
	toFirestore: (inventoryItem) => {
		return {
			itemPath: inventoryItem.itemPath,
			equipped: inventoryItem.equipped,
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