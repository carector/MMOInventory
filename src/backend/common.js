// Imports
const { validationResult } = require('express-validator');

// Reusable function for verifying request parameters + body
const checkValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.mapped() });
	} else {
		next();
	}
};

const toBool = (value) => {
	return value === true || value === 'true';
};

module.exports = {
	checkValidation,
	toBool,
};
