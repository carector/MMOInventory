// Model
class User {
	constructor(data) {
		this.uid = data.uid;
		this.name = data.name || 'New User';
		this.inventory = data.inventory || [];
		this.gold = data.gold >= 0 ? data.gold : 0 || 0;	// Positive values only
		this.equippedItems = {
			head: data.equippedItems?.head || '',
			chest: data.equippedItems?.chest || '',
			leftHand: data.equippedItems?.leftHand || '',
			rightHand: data.equippedItems?.rightHand || '',
			legs: data.equippedItems?.legs || '',
			feet: data.equippedItems?.feet || ''
		}
	} 
}

// Firestore data converter
const userConverter = {
	toFirestore: (user) => {
		return {
			uid: user.uid,
			name: user.name,
			gold: user.gold,
			inventory: user.inventory,
			equippedItems: user.equippedItems
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return new User(data);
	},
};

module.exports = { User, userConverter };
