// Imports
const express = require('express');
const { validationResult } = require('express-validator');

// Local imports
const usersController = require('../controllers/users.controller.js');

// Definitions
const router = express.Router();

const checkValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.mapped() });
	} else {
		next();
	}
};

// Routes
router.route('/health').get((req, res) => res.send('User database'));
router.route('/').get(usersController.getAllUsers);
router.route('/:userID').get(usersController.getUserByID);
router.route('/').post(
	[
		(req, res, next) => {
			console.log(req.body);
			next();
		},
		usersController.vr_createUser,
		checkValidation,
	],
	usersController.createUser
);

module.exports = router;
