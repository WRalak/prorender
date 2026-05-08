const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateUserRegistration } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);
router.delete('/account', userController.deleteAccount);

// User favorites
router.get('/favorites', userController.getFavorites);
router.post('/favorites/:propertyId', userController.addToFavorites);
router.delete('/favorites/:propertyId', userController.removeFromFavorites);

// User saved searches
router.get('/saved-searches', userController.getSavedSearches);
router.post('/saved-searches', userController.createSavedSearch);
router.patch('/saved-searches/:id', userController.updateSavedSearch);
router.delete('/saved-searches/:id', userController.deleteSavedSearch);

// User notifications
router.get('/notifications', userController.getNotifications);
router.patch('/notifications/:id/read', userController.markNotificationAsRead);
router.patch('/notifications/read-all', userController.markAllNotificationsAsRead);
router.delete('/notifications/:id', userController.deleteNotification);

// Admin only routes
router.use(restrictTo('admin', 'super_admin'));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id/status', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;