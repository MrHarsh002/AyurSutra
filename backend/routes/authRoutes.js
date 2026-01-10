const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

// Example routes — make sure each function exists in authController
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// NEW: Reset password using POST (correct)
router.post("/reset-password", authController.resetPassword);

module.exports = router;
