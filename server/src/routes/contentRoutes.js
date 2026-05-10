const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Public routes
router.get('/about', contentController.getAboutContent);
router.get('/contact', contentController.getContactInfo);
router.post('/contact', contentController.submitContactForm);
router.get('/faq', contentController.getFAQ);
router.get('/careers', contentController.getCareers);
router.post('/careers', contentController.submitApplication);

module.exports = router;
