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
router.route('/signup').post(
    [
        authController.createUserWithEmailAndPassword,
        usersController.createUser,
    ],
    (req, res) => {
        res.send({authResult: res.locals.authResult, userData: res.locals.userData});
    }
)

router.route('/signin').get(
    [
        authController.signInWithEmail
    ],
    (req, res) => {
        res.send({authResult: res.locals.authResult});
    }
)

router.route('/verify').get(
    [
        authController.verifyUserToken
    ],
    (req, res) => {
        res.send("YEP!");
    }
)

// #endregion

module.exports = router;
