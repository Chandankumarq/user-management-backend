const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('role.view'), roleController.getRoles);
router.post('/', authorize('role.create'), roleController.createRole);
router.put('/:id', authorize('role.edit'), roleController.updateRole);
router.delete('/:id', authorize('role.delete'), roleController.deleteRole);

module.exports = router;