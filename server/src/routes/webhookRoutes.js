const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Stripe webhooks
router.post('/stripe', webhookController.handleStripeWebhook);

// DocuSign webhooks
router.post('/docusign', webhookController.handleDocuSignWebhook);

// Email service webhooks
router.post('/email', webhookController.handleEmailWebhook);

// Cloudinary webhooks
router.post('/cloudinary', webhookController.handleCloudinaryWebhook);

// Custom webhooks
router.post('/custom/:event', webhookController.handleCustomWebhook);

module.exports = router;