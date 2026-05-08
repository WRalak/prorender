const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

// All subscription routes require authentication
router.use(protect);

// User subscription management
router.get('/current', auditLog('subscription_current'), subscriptionController.getCurrentSubscription);
router.get('/history', auditLog('subscription_history'), subscriptionController.getSubscriptionHistory);
router.post('/create', auditLog('subscription_create'), subscriptionController.createSubscription);
router.patch('/update', auditLog('subscription_update'), subscriptionController.updateSubscription);
router.post('/cancel', auditLog('subscription_cancel'), subscriptionController.cancelSubscription);
router.post('/reactivate', auditLog('subscription_reactivate'), subscriptionController.reactivateSubscription);

// Plan management
router.get('/plans', auditLog('subscription_plans'), subscriptionController.getPlans);
router.get('/plans/:id', auditLog('subscription_plan_view'), subscriptionController.getPlan);

// Payment methods
router.get('/payment-methods', auditLog('subscription_payment_methods'), subscriptionController.getPaymentMethods);
router.post('/payment-methods', auditLog('subscription_payment_method_add'), subscriptionController.addPaymentMethod);
router.delete('/payment-methods/:id', auditLog('subscription_payment_method_remove'), subscriptionController.removePaymentMethod);

// Invoices
router.get('/invoices', auditLog('subscription_invoices'), subscriptionController.getInvoices);
router.get('/invoices/:id', auditLog('subscription_invoice_view'), subscriptionController.getInvoice);
router.post('/invoices/:id/pay', auditLog('subscription_invoice_pay'), subscriptionController.payInvoice);

// Usage tracking
router.get('/usage', auditLog('subscription_usage'), subscriptionController.getUsage);
router.get('/usage/:metric', auditLog('subscription_usage_metric'), subscriptionController.getUsageMetric);

// Admin only
router.use(restrictTo('admin'));
router.get('/admin/all', auditLog('subscription_admin_all'), subscriptionController.getAllSubscriptions);
router.get('/admin/:id', auditLog('subscription_admin_view'), subscriptionController.getSubscription);
router.patch('/admin/:id', auditLog('subscription_admin_update'), subscriptionController.updateSubscriptionAdmin);
router.delete('/admin/:id', auditLog('subscription_admin_delete'), subscriptionController.deleteSubscriptionAdmin);

module.exports = router;