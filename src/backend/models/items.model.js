// Model
class Item {
	constructor(data) {
		this.baseItemName = data.baseItemName;
		this.description = data?.description || 'No description provided.';
		this.stackable = data?.stackable || false;
		this.thumbnailURL = data?.thumbnailURL || '';
        this.disabledGlobally = data?.disabledGlobally || false;
	}
}

// Firestore data converter
const itemConverter = {
	toFirestore: (item) => {
		return {
			baseItemName: item?.baseItemName,
			description: item.description,
			stackable: item.stackable,
			thumbnailURL: item.thumbnailURL,
            disabledGlobally: item.disabledGlobally
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return new Item(data);
	},
};

module.exports = { Item, itemConverter };
