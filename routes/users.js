const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.get('/', authorize('user.view'), userController.getUsers);
router.post('/invite', authorize('user.create'), userController.inviteUser);

module.exports = router;