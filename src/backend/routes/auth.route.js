// #region Imports
const express = require('express');
const { check, param, body } = require('express-validator');

// Local imports
const authController = require('../controllers/auth.controller.js');
const { checkValidation } = require('../common.js');
// #endregion

// #region Routes
const router = express.Router();

// Health endpoint
router.route('/health').get((req, res) => res.send('Auth controller'));

// #endregion

module.exports = router;
