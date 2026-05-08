const Lease = require('../models/Lease');
const Property = require('../models/Property');
const Application = require('../models/Application');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getLeases = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { 'property.title': { $regex: search, $options: 'i' } },
      { 'tenant.name.first': { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter based on user role
  if (req.user.role === 'tenant') {
    query.tenant = req.user.id;
  } else if (req.user.role === 'agent') {
    query.agent = req.user.id;
  }

  const leases = await Lease.find(query)
    .populate('property', 'title address')
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Lease.countDocuments(query);

  res.json({
    success: true,
    leases,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getLease = catchAsync(async (req, res, next) => {
  const lease = await Lease.findById(req.params.id)
    .populate('property', 'title address images')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar')
    .populate('documents')
    .populate('paymentHistory');

  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this lease', 403));
  }

  res.json({
    success: true,
    lease
  });
});

exports.createLease = catchAsync(async (req, res, next) => {
  const {
    propertyId,
    tenantId,
    startDate,
    endDate,
    rentAmount,
    securityDeposit,
    terms,
    documents
  } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const tenant = await User.findById(tenantId);
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot create leases', 403));
  }

  const lease = await Lease.create({
    property: propertyId,
    tenant: tenantId,
    agent: req.user.id,
    startDate,
    endDate,
    rentAmount,
    securityDeposit,
    terms,
    documents: documents || [],
    status: 'draft'
  });

  // Update application status if exists
  const application = await Application.findOne({
    property: propertyId,
    tenant: tenantId,
    status: 'approved'
  });

  if (application) {
    application.lease = lease._id;
    application.status = 'leased';
    await application.save();
  }

  // Notify tenant
  await Notification.create({
    user: tenantId,
    type: 'lease_created',
    title: 'New Lease Created',
    message: `A new lease has been created for ${property.title}`,
    relatedId: lease._id,
    relatedModel: 'Lease'
  });

  const populatedLease = await Lease.findById(lease._id)
    .populate('property', 'title address')
    .populate('tenant', 'name email')
    .populate('agent', 'name email');

  res.status(201).json({
    success: true,
    lease: populatedLease
  });
});

exports.updateLease = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot update leases', 403));
  }

  if (req.user.role === 'agent' && lease.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this lease', 403));
  }

  Object.keys(updates).forEach(key => {
    lease[key] = updates[key];
  });

  await lease.save();

  const populatedLease = await Lease.findById(lease._id)
    .populate('property', 'title address')
    .populate('tenant', 'name email')
    .populate('agent', 'name email');

  res.json({
    success: true,
    lease: populatedLease
  });
});

exports.deleteLease = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can delete leases', 403));
  }

  await Lease.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Lease deleted successfully'
  });
});

exports.getLeaseDocuments = catchAsync(async (req, res, next) => {
  const lease = await Lease.findById(req.params.id)
    .populate('documents');

  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view lease documents', 403));
  }

  res.json({
    success: true,
    documents: lease.documents
  });
});

exports.uploadLeaseDocument = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, type } = req.body;
  
  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot upload lease documents', 403));
  }

  if (req.user.role === 'agent' && lease.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to upload lease documents', 403));
  }

  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const document = {
    title,
    type,
    url: req.file.path,
    filename: req.file.filename,
    uploadedBy: req.user.id,
    uploadedAt: new Date()
  };

  lease.documents.push(document);
  await lease.save();

  res.status(201).json({
    success: true,
    document
  });
});

exports.deleteLeaseDocument = catchAsync(async (req, res, next) => {
  const { id, documentId } = req.params;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot delete lease documents', 403));
  }

  if (req.user.role === 'agent' && lease.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete lease documents', 403));
  }

  lease.documents = lease.documents.filter(doc => doc._id.toString() !== documentId);
  await lease.save();

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

exports.signLease = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { signatureData, signatureType = 'digital' } = req.body;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to sign this lease', 403));
  }

  const signature = {
    user: req.user.id,
    signatureData,
    signatureType,
    signedAt: new Date()
  };

  lease.signatures.push(signature);
  
  // Update status if both parties have signed
  if (lease.signatures.length === 2) {
    lease.status = 'active';
    lease.signedAt = new Date();
  }

  await lease.save();

  // Notify other party
  const notifyUser = req.user.role === 'tenant' ? lease.agent : lease.tenant;
  await Notification.create({
    user: notifyUser,
    type: 'lease_signed',
    title: 'Lease Signed',
    message: `Lease has been signed by ${req.user.name.first} ${req.user.name.last}`,
    relatedId: lease._id,
    relatedModel: 'Lease'
  });

  res.json({
    success: true,
    lease
  });
});

exports.eSignLease = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { signerEmail, signerName } = req.body;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot initiate e-signature', 403));
  }

  // TODO: Implement DocuSign integration
  console.log(`E-signature would be initiated for ${signerEmail}`);

  res.json({
    success: true,
    message: 'E-signature initiated successfully'
  });
});

exports.getSignatureStatus = catchAsync(async (req, res, next) => {
  const lease = await Lease.findById(req.params.id)
    .populate('signatures.user', 'name email');

  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view lease signature status', 403));
  }

  res.json({
    success: true,
    signatures: lease.signatures,
    isFullySigned: lease.signatures.length === 2
  });
});

exports.getLeasePayments = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  const query = { lease: id };
  
  if (status) query.status = status;

  const payments = await Payment.find(query)
    .populate('tenant', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.createLeasePayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { amount, type, dueDate, description } = req.body;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot create lease payments', 403));
  }

  const payment = await Payment.create({
    lease: id,
    tenant: lease.tenant,
    agent: lease.agent,
    amount,
    type,
    dueDate,
    description,
    status: 'pending'
  });

  // Add to lease payment history
  lease.paymentHistory.push(payment._id);
  await lease.save();

  // Notify tenant
  await Notification.create({
    user: lease.tenant,
    type: 'payment_due',
    title: 'New Payment Due',
    message: `A new payment of $${amount} is due for your lease`,
    relatedId: payment._id,
    relatedModel: 'Payment'
  });

  const populatedPayment = await Payment.findById(payment._id)
    .populate('tenant', 'name email')
    .populate('agent', 'name email');

  res.status(201).json({
    success: true,
    payment: populatedPayment
  });
});

exports.terminateLease = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason, terminationDate, noticePeriod } = req.body;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to terminate this lease', 403));
  }

  lease.status = 'terminated';
  lease.terminationDate = terminationDate;
  lease.terminationReason = reason;
  lease.noticePeriod = noticePeriod;
  lease.terminatedBy = req.user.id;
  lease.terminatedAt = new Date();
  await lease.save();

  // Notify other party
  const notifyUser = req.user.role === 'tenant' ? lease.agent : lease.tenant;
  await Notification.create({
    user: notifyUser,
    type: 'lease_terminated',
    title: 'Lease Terminated',
    message: `Lease has been terminated. Reason: ${reason}`,
    relatedId: lease._id,
    relatedModel: 'Lease'
  });

  res.json({
    success: true,
    lease
  });
});

exports.renewLease = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { newEndDate, rentAmount, terms } = req.body;

  const lease = await Lease.findById(id);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot renew leases', 403));
  }

  lease.endDate = newEndDate;
  lease.rentAmount = rentAmount;
  lease.terms = terms;
  lease.status = 'renewed';
  lease.renewedAt = new Date();
  await lease.save();

  // Notify tenant
  await Notification.create({
    user: lease.tenant,
    type: 'lease_renewed',
    title: 'Lease Renewed',
    message: `Your lease has been renewed until ${newEndDate}`,
    relatedId: lease._id,
    relatedModel: 'Lease'
  });

  res.json({
    success: true,
    lease
  });
});

exports.getLeaseTemplates = catchAsync(async (req, res, next) => {
  // TODO: Return lease templates
  const templates = [];

  res.json({
    success: true,
    templates
  });
});

exports.createLeaseTemplate = catchAsync(async (req, res, next) => {
  const { name, content, type, jurisdiction } = req.body;

  // TODO: Create lease template
  const template = {
    name,
    content,
    type,
    jurisdiction,
    createdBy: req.user.id
  };

  res.status(201).json({
    success: true,
    template
  });
});

exports.updateLeaseTemplate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // TODO: Update lease template
  const template = { id, ...updates };

  res.json({
    success: true,
    template
  });
});

exports.deleteLeaseTemplate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // TODO: Delete lease template

  res.json({
    success: true,
    message: 'Lease template deleted successfully'
  });
});

// Methods are already exported with exports syntax
