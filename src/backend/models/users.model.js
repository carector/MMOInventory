// Imports
const {doc, setDoc} = require('firebase/firestore')

// Model
class User {
    constructor(data) {
        this.name = data?.name;
        this.email = data?.email;
    }
    toString() {
        return `${this.name}, ${this.email}`;
    }
}

// Firestore data converter
const userConverter = {
    toFirestore: (user) => {
        return {
            name: user.name,
            email: user.email
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options)
        return new User(data);
    }
}

module.exports = { User, userConverter }