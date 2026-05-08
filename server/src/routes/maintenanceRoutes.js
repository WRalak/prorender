const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateMaintenanceRequest } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Tenant routes
router.get('/', maintenanceController.getMaintenanceRequests);
router.get('/:id', maintenanceController.getMaintenanceRequest);
router.post('/', validateMaintenanceRequest, upload.array('images', 5), maintenanceController.createMaintenanceRequest);
router.patch('/:id', maintenanceController.updateMaintenanceRequest);
router.post('/:id/images', upload.array('images', 3), maintenanceController.uploadImages);
router.patch('/:id/rate', maintenanceController.rateMaintenance);

// Agent routes
router.use(restrictTo('agent', 'admin'));
router.patch('/:id/status', maintenanceController.updateStatus);
router.patch('/:id/assign', maintenanceController.assignTechnician);
router.post('/:id/timeline', maintenanceController.addTimelineEntry);
router.patch('/:id/cost', maintenanceController.updateCost);

// Admin routes
router.use(restrictTo('admin'));
router.get('/all', maintenanceController.getAllMaintenanceRequests);
router.get('/analytics', maintenanceController.getMaintenanceAnalytics);
router.get('/categories', maintenanceController.getCategories);

module.exports = router;