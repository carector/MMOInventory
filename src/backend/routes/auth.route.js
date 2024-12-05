// #region Imports
const express = require('express');
const { check, param, body } = require('express-validator');

// Local imports
const authController = require('../controllers/auth.controller.js');
const usersController = require('../controllers/users.controller.js');

const { checkValidation } = require('../common.js');
// #endregion

// #region Routes
const router = express.Router();

// Health endpoint
router.route('/health').get((req, res) => res.send('Auth controller'));

// Create user using email+password
router
	.route('/signup')
	.post(
		[
			authController.createUserWithEmailAndPassword,
			usersController.createUser,
		],
		(req, res) => {
			res.send({
				message: res.locals.authUserResult
					? 'Successfully created user.'
					: 'Successfully created guest user. (Expires in 1 hour)',
				userAuth: res.locals.authUserResult,
				tokens: res.locals.authResult._tokenResponse,
				userData: res.locals.userData,
			});
		}
	);

router.route('/signin').get([authController.signInWithEmail], (req, res) => {
	res.send(res.locals.authUserResult);
});

router.route('/verify').get([authController.verifyUserToken], (req, res) => {
	res.send(res.locals.authUserResult);
});

// #endregion

module.exports = router;
