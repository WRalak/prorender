const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Dashboard and analytics
router.get('/dashboard', auditLog('admin_dashboard'), adminController.getDashboard);
router.get('/stats', auditLog('admin_stats'), adminController.getStats);
router.get('/analytics', auditLog('admin_analytics'), adminController.getAnalytics);

// User management
router.get('/users', auditLog('admin_users_list'), adminController.getUsers);
router.get('/users/:id', auditLog('admin_user_view'), adminController.getUser);
router.patch('/users/:id', auditLog('admin_user_update'), adminController.updateUser);
router.delete('/users/:id', auditLog('admin_user_delete'), adminController.deleteUser);
router.post('/users/:id/ban', auditLog('admin_user_ban'), adminController.banUser);
router.post('/users/:id/unban', auditLog('admin_user_unban'), adminController.unbanUser);

// Property management
router.get('/properties', auditLog('admin_properties_list'), adminController.getProperties);
router.get('/properties/:id', auditLog('admin_property_view'), adminController.getProperty);
router.patch('/properties/:id', auditLog('admin_property_update'), adminController.updateProperty);
router.delete('/properties/:id', auditLog('admin_property_delete'), adminController.deleteProperty);

// Application management
router.get('/applications', auditLog('admin_applications_list'), adminController.getApplications);
router.get('/applications/:id', auditLog('admin_application_view'), adminController.getApplication);
router.patch('/applications/:id', auditLog('admin_application_update'), adminController.updateApplication);

// Payment management
router.get('/payments', auditLog('admin_payments_list'), adminController.getPayments);
router.get('/payments/:id', auditLog('admin_payment_view'), adminController.getPayment);
router.post('/payments/:id/refund', auditLog('admin_payment_refund'), adminController.refundPayment);

// Maintenance management
router.get('/maintenance', auditLog('admin_maintenance_list'), adminController.getMaintenanceRequests);
router.get('/maintenance/:id', auditLog('admin_maintenance_view'), adminController.getMaintenanceRequest);
router.patch('/maintenance/:id', auditLog('admin_maintenance_update'), adminController.updateMaintenanceRequest);

// Reports and analytics
router.get('/reports', auditLog('admin_reports_list'), adminController.getReports);
router.post('/reports/generate', auditLog('admin_report_generate'), adminController.generateReport);
router.get('/reports/:id', auditLog('admin_report_view'), adminController.getReport);
router.delete('/reports/:id', auditLog('admin_report_delete'), adminController.deleteReport);

// System settings
router.get('/settings', auditLog('admin_settings_view'), adminController.getSettings);
router.patch('/settings', auditLog('admin_settings_update'), adminController.updateSettings);
router.post('/settings/test-email', auditLog('admin_test_email'), adminController.testEmailSettings);
router.post('/settings/regenerate-api-key', auditLog('admin_regenerate_api'), adminController.regenerateApiKey);

// Logs and monitoring
router.get('/logs', auditLog('admin_logs_view'), adminController.getLogs);
router.get('/system-health', auditLog('admin_system_health'), adminController.getSystemHealth);

// Notifications
router.get('/notifications', auditLog('admin_notifications_list'), adminController.getNotifications);
router.post('/notifications', auditLog('admin_notification_create'), adminController.createNotification);
router.patch('/notifications/:id', auditLog('admin_notification_update'), adminController.updateNotification);
router.delete('/notifications/:id', auditLog('admin_notification_delete'), adminController.deleteNotification);

// Backup and restore
router.post('/backup', auditLog('admin_backup_create'), adminController.createBackup);
router.get('/backups', auditLog('admin_backups_list'), adminController.getBackups);
router.post('/restore', auditLog('admin_restore'), adminController.restoreBackup);

module.exports = router;