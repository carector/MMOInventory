// #region Imports
const auth = require('firebase/auth');
const { getDb } = require('../fb.js');
const { toBool } = require('../common.js');
// #endregion

// #region Middleware functions
const getCurrentUser = async function(req, res, next) { res.status(400).send("TODO"); }
const createUserWithEmailAndPassword = async function(req, res, next) { res.status(400).send("TODO"); }
const resetPassword = async function(req, res, next) { res.status(400).send("TODO"); }
const verifyPasswordResetCode = async function(req, res, next) { res.status(400).send("TODO"); }
const setPersistence = async function(req, res, next) { res.status(400).send("TODO"); } // i.e. stay logged in checkbox

const signIn = async function(req, res, next) { res.status(400).send("TODO"); }
const signOut = async function(req, res, next) { res.status(400).send("TODO"); }


// #endregion

module.exports = {
	getCurrentUser,
    createUserWithEmailAndPassword,
    resetPassword,
    verifyPasswordResetCode,
    setPersistence,
    signIn,
    signOut
};
