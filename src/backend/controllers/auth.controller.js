// #region Imports
const { getAuth } = require('../fb.js');
const fbAuth = require('firebase/auth');
const { toBool } = require('../common.js');
// #endregion

// #region Middleware functions
const getCurrentUser = async function (req, res, next) {
	res.status(400).send('TODO');
};

const createUserWithEmailAndPassword = async function (req, res, next) {
	const auth = getAuth();
	try {
		const email = req.body.email;
		const password = req.body.password;
		const result = await fbAuth.createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		res.locals.authResult = result;
		next();
	} catch (e) {
		console.log(e);
		return res.status(400).send(`Error: ${e}`);
	}
};

const deleteUser = async function (req, res, next) {
	res.status(400).send('TODO');
};
const resetPassword = async function (req, res, next) {
	res.status(400).send('TODO');
};
const verifyPasswordResetCode = async function (req, res, next) {
	res.status(400).send('TODO');
};
const setPersistence = async function (req, res, next) {
	res.status(400).send('TODO');
}; // i.e. stay logged in checkbox

// Credentials
const getGoogleCredential = async function (req, res, next) {};
const signInUsingCredential = async function (req, res, next) {};

const signIn = async function (req, res, next) {
	res.status(400).send('TODO');
};
const signOut = async function (req, res, next) {
	res.status(400).send('TODO');
};

// #endregion

module.exports = {
	getCurrentUser,
	createUserWithEmailAndPassword,
	resetPassword,
	verifyPasswordResetCode,
	setPersistence,
	signIn,
	signOut,
};
