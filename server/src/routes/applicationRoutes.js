const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateApplication } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Application routes
router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplication);
router.post('/', validateApplication, applicationController.createApplication);
router.patch('/:id', applicationController.updateApplication);
router.post('/:id/documents', upload.single('document'), applicationController.uploadDocument);
router.patch('/:id/withdraw', applicationController.withdrawApplication);

module.exports = router;