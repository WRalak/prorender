const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', agentController.getAgents);
router.get('/featured', agentController.getFeaturedAgents);
router.get('/search', agentController.searchAgents);
router.get('/:id', agentController.getAgent);
router.get('/:id/properties', agentController.getAgentProperties);
router.get('/:id/reviews', agentController.getAgentReviews);

// Protected routes
router.use(protect);

// Agent profile management
router.patch('/profile', restrictTo('agent'), agentController.updateAgentProfile);
router.post('/profile/image', restrictTo('agent'), agentController.uploadProfileImage);
router.patch('/availability', restrictTo('agent'), agentController.updateAvailability);

// User interactions with agents
router.post('/:id/contact', agentController.contactAgent);
router.post('/:id/favorite', agentController.toggleFavoriteAgent);
router.post('/:id/review', agentController.addAgentReview);

// Admin routes
router.patch('/:id/verify', restrictTo('admin'), agentController.verifyAgent);
router.patch('/:id/suspend', restrictTo('admin'), agentController.suspendAgent);

module.exports = router;
