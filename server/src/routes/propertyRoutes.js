const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateProperty } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', propertyController.getProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getProperty);
router.get('/:id/similar', propertyController.getSimilarProperties);

// Protected routes
router.use(protect);

// Agent only routes
router.post('/', restrictTo('agent'), validateProperty, propertyController.createProperty);
router.patch('/:id', restrictTo('agent'), validateProperty, propertyController.updateProperty);
router.delete('/:id', restrictTo('agent'), propertyController.deleteProperty);
router.post('/:id/images', restrictTo('agent'), upload.array('images', 10), propertyController.uploadImages);
router.delete('/:id/images/:imageId', restrictTo('agent'), propertyController.deleteImage);
router.patch('/:id/feature', restrictTo('agent'), propertyController.toggleFeatured);

// User interactions
router.post('/:id/favorite', propertyController.toggleFavorite);
router.post('/:id/inquiry', propertyController.sendInquiry);
router.post('/:id/schedule-viewing', propertyController.scheduleViewing);

// Admin routes
router.patch('/:id/approve', restrictTo('admin'), propertyController.approveProperty);
router.patch('/:id/suspend', restrictTo('admin'), propertyController.suspendProperty);

module.exports = router;