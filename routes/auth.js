const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateSignup, validateOTP } = require('../middleware/validation');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/verify-otp', validateOTP, authController.verifyOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;