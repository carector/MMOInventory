// Model
class InventoryItem {
	constructor(userID, itemID, dateUnlocked) {
		this.userID = userID;
		this.itemID = itemID;
        this.dateUnlocked = dateUnlocked;
	}
	toString() {
		return `${this.userID} : ${this.itemID} (Unlocked ${this.dateUnlocked})`;
	}
}

// Firestore data converter
const inventoryItemConverter = {
	toFirestore: (inventoryItem) => {
		return {
			userID: inventoryItem.userID,
			itemID: inventoryItem.itemID,
            dateUnlocked: inventoryItem.dateUnlocked
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return new InventoryItem(data);
	},
};

module.exports = inventoryItemConverter;