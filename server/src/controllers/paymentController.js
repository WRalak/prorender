const Payment = require('../models/Payment');
const Lease = require('../models/Lease');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getPayments = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};
  
  if (status) query.status = status;
  
  // Filter based on user role
  if (req.user.role === 'tenant') {
    query.tenant = req.user.id;
  } else if (req.user.role === 'agent' || req.user.role === 'admin') {
    query.agent = req.user.id;
  }

  const payments = await Payment.find(query)
    .populate('lease', 'property tenant')
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
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

exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('lease')
    .populate('tenant', 'name email')
    .populate('agent', 'name email');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && payment.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this payment', 403));
  }

  res.json({
    success: true,
    payment
  });
});

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const { leaseId, amount, type = 'rent' } = req.body;

  const lease = await Lease.findById(leaseId).populate('property');
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to make payment for this lease', 403));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    metadata: {
      leaseId,
      type,
      tenantId: req.user.id
    }
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
});

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { paymentIntentId, leaseId, amount, type = 'rent' } = req.body;

  // Retrieve the payment intent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError('Payment not successful', 400));
  }

  // Create payment record
  const payment = await Payment.create({
    lease: leaseId,
    tenant: req.user.id,
    agent: req.user.role === 'tenant' ? null : req.user.id,
    amount,
    type,
    status: 'completed',
    method: 'stripe',
    transactionId: paymentIntent.id,
    paidAt: new Date()
  });

  // Update lease if it's rent payment
  if (type === 'rent') {
    await Lease.findByIdAndUpdate(leaseId, {
      $push: { paymentHistory: payment._id }
    });
  }

  res.json({
    success: true,
    payment
  });
});

exports.createManualPayment = catchAsync(async (req, res, next) => {
  const { leaseId, amount, type = 'rent', method = 'cash', notes } = req.body;

  const lease = await Lease.findById(leaseId);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions (agents and admins can create manual payments)
  if (req.user.role === 'tenant') {
    return next(new AppError('Not authorized to create manual payments', 403));
  }

  const payment = await Payment.create({
    lease: leaseId,
    tenant: lease.tenant,
    agent: req.user.id,
    amount,
    type,
    method,
    status: 'completed',
    notes,
    paidAt: new Date()
  });

  // Update lease if it's rent payment
  if (type === 'rent') {
    await Lease.findByIdAndUpdate(leaseId, {
      $push: { paymentHistory: payment._id }
    });
  }

  res.status(201).json({
    success: true,
    payment
  });
});

exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  const payment = await Payment.findById(id);
  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Not authorized to update payment status', 403));
  }

  payment.status = status;
  if (status === 'completed') {
    payment.paidAt = new Date();
  }
  await payment.save();

  res.json({
    success: true,
    payment
  });
});

exports.getPaymentStats = catchAsync(async (req, res, next) => {
  const { timeRange = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const stats = await Payment.aggregate(pipeline);

  res.json({
    success: true,
    stats
  });
});

// Add missing methods that routes expect
exports.createPayment = catchAsync(async (req, res, next) => {
  const { leaseId, amount, type = 'rent', method = 'stripe' } = req.body;
  
  const lease = await Lease.findById(leaseId);
  if (!lease) {
    return next(new AppError('Lease not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && lease.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to make payment for this lease', 403));
  }

  const payment = await Payment.create({
    lease: leaseId,
    tenant: req.user.id,
    agent: req.user.role === 'tenant' ? null : req.user.id,
    amount,
    type,
    method,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    payment
  });
});

exports.updatePayment = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const payment = await Payment.findById(id);
  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Not authorized to update payment', 403));
  }

  Object.keys(updates).forEach(key => {
    payment[key] = updates[key];
  });

  await payment.save();

  res.json({
    success: true,
    payment
  });
});

exports.processRefund = catchAsync(async (req, res, next) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Not authorized to process refunds', 403));
  }

  // Process refund with Stripe
  const refund = await stripe.refunds.create({
    payment_intent: payment.transactionId,
    amount: amount ? amount * 100 : payment.amount * 100,
    reason: 'requested_by_customer',
    metadata: { reason }
  });

  payment.status = 'refunded';
  payment.refundId = refund.id;
  payment.refundedAt = new Date();
  payment.refundAmount = amount || payment.amount;
  payment.refundReason = reason;
  await payment.save();

  res.json({
    success: true,
    refund
  });
});

exports.setupAutopay = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Setup autopay - placeholder' });
});

exports.cancelAutopay = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Cancel autopay - placeholder' });
});

exports.getPaymentHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const payments = await Payment.find({ tenant: req.user.id })
    .populate('lease', 'property')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments({ tenant: req.user.id });

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

exports.getMonthlyStatement = catchAsync(async (req, res, next) => {
  const { month, year } = req.params;
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const payments = await Payment.find({
    tenant: req.user.id,
    status: 'completed',
    paidAt: { $gte: startDate, $lt: endDate }
  }).populate('lease', 'property');

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    success: true,
    statement: {
      month,
      year,
      payments,
      total
    }
  });
});

exports.getAllPayments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  
  if (status) query.status = status;

  const payments = await Payment.find(query)
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
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

exports.getPaymentAnalytics = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Payment analytics - placeholder' });
});

// Methods are already exported with exports syntax