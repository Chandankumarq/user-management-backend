const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

const validateSignup = [
  body('name').trim().isLength({ min: 2 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character'),
  handleValidationErrors
];

const validateOTP = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('sessionId').notEmpty(),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateSignup,
  validateOTP,
  handleValidationErrors
};