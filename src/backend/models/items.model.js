// Model
class Item {
	constructor(data) {
		this.baseItemName = data.baseItemName;
		this.description = data.description || 'No description provided.';
		(this.itemType = data.itemType || 'Consumable'),
			(this.stackable =
				data.stackable || this.type === 'Consumable' || false);
		this.thumbnailURL = data.thumbnailURL || '';
		this.disabledGlobally = data.disabledGlobally || false;
		this.adminPrivRequired = data.adminPrivRequired || false; // Whether admin privileges are required to view this item or not
		this.goldValue = data.goldValue || 0;
	}

	getExtraFields() {
		return {}
	}
}

// TODO: Switch to typescript for models for simplicity
// Consider this a first pass to get basic functionality in place

class ItemType {
	static Equipment = new ItemType('Equipment');
	static Consumable = new ItemType('Consumable');

	constructor(type) {
		this.type = type;
	}

	toString() {
		return this.type;
	}
}

class EquipmentType {
	static head = new EquipmentType('head');
	static chest = new EquipmentType('chest');
	static leftHand = new EquipmentType('leftHand');
	static rightHand = new EquipmentType('rightHand');
	static legs = new EquipmentType('legs');
	static feet = new EquipmentType('feet');

	constructor(type) {
		this.type = type;
	}

	toString() {
		return this.type;
	}
}
class Equipment extends Item {
	constructor(data) {
		super(data);
		this.equipmentType = new EquipmentType(data.equipmentType).toString();
	}

	getExtraFields() {
		return {
			equipmentType: this.equipmentType
		}
	}
}

class Consumable extends Item {
	constructor(data) {
		super(data);
	}
}

const convertToSubclass = function(data) {
	switch (data.itemType) {
		case 'Consumable':
			return new Consumable(data);
		case 'Equipment':
			return new Equipment(data);
	}
}

// Firestore data converter
const itemConverter = {
	toFirestore: (item) => {
		return {
			baseItemName: item.baseItemName,
			description: item.description,
			itemType: item.itemType,
			stackable: item.stackable,
			thumbnailURL: item.thumbnailURL,
			disabledGlobally: item.disabledGlobally,
			goldValue: item.goldValue,
			...item.getExtraFields()
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return convertToSubclass(data);
	},
};

module.exports = { Item, ItemType, EquipmentType, itemConverter, convertToSubclass };
