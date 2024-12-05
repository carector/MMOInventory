// #region Imports
const { getAuth, getAdminApp } = require('../fb.js');
const fbAuth = require('firebase/auth');
const { toBool } = require('../common.js');
// #endregion

// #region Middleware functions
const verifyUserToken = async function (req, res, next) {
	const auth = getAdminApp().auth();
	const token = req.body.idToken;
	try {
		const result = await auth.verifyIdToken(token);
		res.locals.authUserResult = result;
		next();
	} catch (e) {
		return res.status(400).send(`Authentication error: ${e}`);
	}
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
		res.locals.authUserResult = result.user;
		res.locals.authResult = result;
		next();
	} catch (e) {
		console.log(e);
		return res.status(400).send(`Error creating user: ${e}`);
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

const signInWithEmail = async function (req, res, next) {
	const auth = getAuth();
	try {
		const email = req.body.email;
		const password = req.body.password;
		const result = await fbAuth.signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		res.locals.authUserResult = result;
		next();
	} catch (e) {
		return res.status(400).send(`Error signing in: ${e}`);
	}
};
const signOut = async function (req, res, next) {
	res.status(400).send('TODO');
};

// #endregion

module.exports = {
	createUserWithEmailAndPassword,
	resetPassword,
	verifyPasswordResetCode,
	verifyUserToken,
	setPersistence,
	signInWithEmail,
	signOut,
};
