const express = require('express');
const router = express.Router();
const listPropertyController = require('../controllers/listPropertyController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateProperty } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Get listing form data and requirements
router.get('/requirements', listPropertyController.getListingRequirements);
router.get('/spaces', listPropertyController.getUserSpaces);

// Create new property listing
router.post('/', 
  restrictTo('agent'), 
  validateProperty, 
  listPropertyController.createPropertyListing
);

// Upload property images
router.post('/upload-images', 
  restrictTo('agent'),
  upload.array('images', 10),
  listPropertyController.uploadPropertyImages
);

// Save draft listing
router.post('/draft', 
  restrictTo('agent'),
  listPropertyController.saveDraftListing
);

// Get draft listings
router.get('/drafts', 
  restrictTo('agent'),
  listPropertyController.getDraftListings
);

// Publish draft
router.patch('/draft/:id/publish', 
  restrictTo('agent'),
  listPropertyController.publishDraftListing
);

// Delete draft
router.delete('/draft/:id', 
  restrictTo('agent'),
  listPropertyController.deleteDraftListing
);

// Estimate property value
router.post('/estimate', 
  listPropertyController.estimatePropertyValue
);

// Get similar properties for pricing reference
router.get('/similar', 
  listPropertyController.getSimilarPropertiesForPricing
);

module.exports = router;
