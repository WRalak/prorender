const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

// All space routes require authentication
router.use(protect);

// Space management
router.get('/', auditLog('space_list'), spaceController.getSpaces);
router.get('/:id', auditLog('space_view'), spaceController.getSpace);
router.post('/', restrictTo('agent', 'admin'), auditLog('space_create'), spaceController.createSpace);
router.patch('/:id', restrictTo('agent', 'admin'), auditLog('space_update'), spaceController.updateSpace);
router.delete('/:id', restrictTo('agent', 'admin'), auditLog('space_delete'), spaceController.deleteSpace);

// Space statistics
router.get('/stats/overview', auditLog('space_stats'), spaceController.getSpaceStats);

module.exports = router;