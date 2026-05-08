const express = require('express');
const router = express.Router();
const leaseController = require('../controllers/leaseController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

// All lease routes require authentication
router.use(protect);

// Lease management
router.get('/', auditLog('lease_list'), leaseController.getLeases);
router.get('/:id', auditLog('lease_view'), leaseController.getLease);
router.post('/', restrictTo('agent', 'admin'), auditLog('lease_create'), leaseController.createLease);
router.patch('/:id', restrictTo('agent', 'admin'), auditLog('lease_update'), leaseController.updateLease);
router.delete('/:id', restrictTo('admin'), auditLog('lease_delete'), leaseController.deleteLease);

// Lease documents
router.get('/:id/documents', auditLog('lease_documents_list'), leaseController.getLeaseDocuments);
router.post('/:id/documents', auditLog('lease_document_upload'), leaseController.uploadLeaseDocument);
router.delete('/:id/documents/:documentId', auditLog('lease_document_delete'), leaseController.deleteLeaseDocument);

// Lease signing
router.post('/:id/sign', auditLog('lease_sign'), leaseController.signLease);
router.post('/:id/esign', auditLog('lease_esign'), leaseController.eSignLease);
router.get('/:id/signature-status', auditLog('lease_signature_status'), leaseController.getSignatureStatus);

// Lease payments
router.get('/:id/payments', auditLog('lease_payments'), leaseController.getLeasePayments);
router.post('/:id/payments', auditLog('lease_payment_create'), leaseController.createLeasePayment);

// Lease termination
router.post('/:id/terminate', auditLog('lease_terminate'), leaseController.terminateLease);
router.post('/:id/renew', auditLog('lease_renew'), leaseController.renewLease);

// Lease templates
router.get('/templates', restrictTo('admin'), auditLog('lease_templates_list'), leaseController.getLeaseTemplates);
router.post('/templates', restrictTo('admin'), auditLog('lease_template_create'), leaseController.createLeaseTemplate);
router.patch('/templates/:id', restrictTo('admin'), auditLog('lease_template_update'), leaseController.updateLeaseTemplate);
router.delete('/templates/:id', restrictTo('admin'), auditLog('lease_template_delete'), leaseController.deleteLeaseTemplate);

module.exports = router;