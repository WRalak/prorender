const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// All routes require authentication
router.use(protect);

// Payment routes
router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.post('/', validatePayment, paymentController.createPayment);
router.patch('/:id', paymentController.updatePayment);

// Stripe payment processing
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/confirm-payment', paymentController.confirmPayment);
router.post('/refund/:paymentId', paymentController.processRefund);

// Recurring payments
router.post('/setup-autopay', paymentController.setupAutopay);
router.delete('/cancel-autopay/:paymentMethodId', paymentController.cancelAutopay);

// Payment history and statements
router.get('/history', paymentController.getPaymentHistory);
router.get('/statement/:month/:year', paymentController.getMonthlyStatement);

// Admin routes
router.use(restrictTo('admin'));
router.get('/all', paymentController.getAllPayments);
router.patch('/:id/status', paymentController.updatePaymentStatus);
router.get('/analytics', paymentController.getPaymentAnalytics);

module.exports = router;