const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { protect, restrictTo } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

// All super admin routes require authentication and super admin role
router.use(protect);
router.use(restrictTo('super_admin'));

// System management
router.get('/system/health', auditLog('super_admin_system_health'), superAdminController.getSystemHealth);
router.get('/system/metrics', auditLog('super_admin_system_metrics'), superAdminController.getSystemMetrics);
router.post('/system/maintenance', auditLog('super_admin_maintenance'), superAdminController.toggleMaintenance);

// User management across all instances
router.get('/users/all', auditLog('super_admin_users_all'), superAdminController.getAllUsers);
router.get('/users/:id', auditLog('super_admin_user_view'), superAdminController.getUser);
router.patch('/users/:id/role', auditLog('super_admin_user_role'), superAdminController.updateUserRole);
router.delete('/users/:id', auditLog('super_admin_user_delete'), superAdminController.deleteUser);

// Admin management
router.get('/admins', auditLog('super_admin_admins'), superAdminController.getAdmins);
router.post('/admins', auditLog('super_admin_admin_create'), superAdminController.createAdmin);
router.patch('/admins/:id', auditLog('super_admin_admin_update'), superAdminController.updateAdmin);
router.delete('/admins/:id', auditLog('super_admin_admin_delete'), superAdminController.deleteAdmin);

// Global settings
router.get('/settings', auditLog('super_admin_settings'), superAdminController.getGlobalSettings);
router.patch('/settings', auditLog('super_admin_settings_update'), superAdminController.updateGlobalSettings);

// System logs
router.get('/logs', auditLog('super_admin_logs'), superAdminController.getSystemLogs);
router.get('/logs/:type', auditLog('super_admin_logs_filtered'), superAdminController.getLogsByType);

// Database management
router.get('/database/stats', auditLog('super_admin_db_stats'), superAdminController.getDatabaseStats);
router.post('/database/backup', auditLog('super_admin_db_backup'), superAdminController.createDatabaseBackup);
router.post('/database/restore', auditLog('super_admin_db_restore'), superAdminController.restoreDatabase);

// Security
router.get('/security/audit', auditLog('super_admin_security_audit'), superAdminController.getSecurityAudit);
router.post('/security/reset-passwords', auditLog('super_admin_reset_passwords'), superAdminController.resetAllPasswords);

module.exports = router;