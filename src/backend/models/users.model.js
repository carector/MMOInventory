// Model
class User {
	constructor(data) {
		this.name = data.name || 'New User';
		this.inventory = data.inventory || [];
	} 
}

// Firestore data converter
const userConverter = {
	toFirestore: (user) => {
		return {
			name: user.name,
			inventory: user.inventory
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return new User(data);
	},
};

module.exports = { User, userConverter };
