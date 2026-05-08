const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public search routes
router.get('/properties', searchController.searchProperties);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/filters', searchController.getAvailableFilters);

// Advanced search
router.post('/properties/advanced', searchController.advancedPropertySearch);
router.get('/properties/map', searchController.mapSearch);

// Saved searches (protected)
const { protect } = require('../middleware/auth');
router.post('/saved-searches', protect, searchController.saveSearch);
router.get('/saved-searches', protect, searchController.getSavedSearches);
router.delete('/saved-searches/:id', protect, searchController.deleteSavedSearch);

module.exports = router;