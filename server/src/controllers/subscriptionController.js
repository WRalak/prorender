const Subscription = require('../models/Subscription');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

// Plan configurations
const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Agent',
    price: 4900,
    currency: 'kes',
    interval: 'month',
    features: [
      'Up to 10 property listings',
      'Basic analytics dashboard',
      'Chat with tenants',
      'Schedule viewings',
      'Email support',
      'Basic branding options'
    ],
    propertyLimit: 10,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID
  },
  pro: {
    id: 'pro',
    name: 'Pro Agent',
    price: 9900,
    currency: 'kes',
    interval: 'month',
    features: [
      'Up to 50 property listings',
      'Advanced analytics dashboard',
      'Chat with tenants (file attachments)',
      'Schedule viewings + Google Calendar sync',
      'Priority support',
      'Advanced branding options',
      'Lease generation tools',
      'Rent collection via Stripe'
    ],
    propertyLimit: 50,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  }
};

const getPlanDetails = (planId) => {
  return PLANS[planId];
};

exports.getCurrentSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  })
  .populate('paymentMethods')
  .populate('invoices');

  res.json({
    success: true,
    subscription
  });
});

exports.getSubscriptionHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const subscriptions = await Subscription.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Subscription.countDocuments({ user: req.user.id });

  res.json({
    success: true,
    subscriptions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getAvailablePlans = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    plans: Object.values(PLANS)
  });
});

exports.checkSubscriptionStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  const hasActiveSubscription = user.hasActiveSubscription();
  const propertyLimit = user.getPropertyLimit();
  const currentPlan = user.subscription?.plan;
  
  res.json({
    success: true,
    hasActiveSubscription,
    currentPlan,
    propertyLimit,
    subscription: user.subscription
  });
});

exports.createSubscription = catchAsync(async (req, res, next) => {
  const { plan, paymentMethodId } = req.body;

  // Get plan details
  const planDetails = await getPlanDetails(plan);
  if (!planDetails) {
    return next(new AppError('Invalid plan', 400));
  }

  // Create Stripe subscription
  const customer = await getOrCreateStripeCustomer(req.user);
  
  const stripeSubscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{
      price: planDetails.stripePriceId,
      quantity: 1
    }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  const subscription = await Subscription.create({
    user: req.user.id,
    plan,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: customer.id,
    stripePriceId: planDetails.stripePriceId,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    unitAmount: planDetails.amount,
    currency: planDetails.currency,
    interval: planDetails.interval,
    intervalCount: planDetails.intervalCount,
    features: planDetails.features,
    usage: planDetails.usage,
    status: 'active'
  });

  res.status(201).json({
    success: true,
    subscription,
    clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret
  });
});

exports.updateSubscription = catchAsync(async (req, res, next) => {
  const { plan } = req.body;

  const subscription = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  });

  if (!subscription) {
    return next(new AppError('No active subscription found', 404));
  }

  const planDetails = await getPlanDetails(plan);
  if (!planDetails) {
    return next(new AppError('Invalid plan', 400));
  }

  // Update Stripe subscription
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  
  const updatedStripeSubscription = await stripe.subscriptions.update(stripeSubscription.id, {
    items: [{
      id: stripeSubscription.items.data[0].id,
      price: planDetails.stripePriceId,
    }],
  });

  // Update local subscription
  subscription.plan = plan;
  subscription.stripePriceId = planDetails.stripePriceId;
  subscription.unitAmount = planDetails.amount;
  subscription.features = planDetails.features;
  subscription.usage = planDetails.usage;
  subscription.history.push({
    action: 'updated',
    previousPlan: subscription.plan,
    newPlan: plan,
    performedBy: req.user.id
  });

  await subscription.save();

  res.json({
    success: true,
    subscription
  });
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const { atPeriodEnd = true } = req.body;

  const subscription = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  });

  if (!subscription) {
    return next(new AppError('No active subscription found', 404));
  }

  // Cancel Stripe subscription
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: atPeriodEnd
  });

  // Update local subscription
  subscription.cancelAtPeriodEnd = atPeriodEnd;
  subscription.canceledAt = new Date();
  subscription.history.push({
    action: 'cancelled',
    performedBy: req.user.id
  });

  await subscription.save();

  res.json({
    success: true,
    subscription
  });
});

exports.reactivateSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({
    user: req.user.id,
    status: 'active',
    cancelAtPeriodEnd: true
  });

  if (!subscription) {
    return next(new AppError('No cancellable subscription found', 404));
  }

  // Reactivate Stripe subscription
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false
  });

  // Update local subscription
  subscription.cancelAtPeriodEnd = false;
  subscription.canceledAt = undefined;
  subscription.history.push({
    action: 'reactivated',
    performedBy: req.user.id
  });

  await subscription.save();

  res.json({
    success: true,
    subscription
  });
});

exports.getPlans = catchAsync(async (req, res, next) => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      currency: 'usd',
      interval: 'month',
      features: [
        { name: 'Properties', enabled: true, limit: 3 },
        { name: 'Applications', enabled: true, limit: 10 },
        { name: 'Storage', enabled: true, limit: 1000 }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: [
        { name: 'Properties', enabled: true, limit: 20 },
        { name: 'Applications', enabled: true, limit: 100 },
        { name: 'Storage', enabled: true, limit: 10000 }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      currency: 'usd',
      interval: 'month',
      features: [
        { name: 'Properties', enabled: true, limit: -1 },
        { name: 'Applications', enabled: true, limit: -1 },
        { name: 'Storage', enabled: true, limit: 100000 }
      ]
    }
  ];

  res.json({
    success: true,
    plans
  });
});

exports.getPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const plans = await exports.getPlans();
  const plan = plans.plans.find(p => p.id === id);

  if (!plan) {
    return next(new AppError('Plan not found', 404));
  }

  res.json({
    success: true,
    plan
  });
});

exports.getPaymentMethods = catchAsync(async (req, res, next) => {
  const customer = await getOrCreateStripeCustomer(req.user);
  
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card'
  });

  res.json({
    success: true,
    paymentMethods: paymentMethods.data
  });
});

exports.addPaymentMethod = catchAsync(async (req, res, next) => {
  const { paymentMethodId } = req.body;

  const customer = await getOrCreateStripeCustomer(req.user);
  
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id
  });

  res.status(201).json({
    success: true,
    paymentMethod
  });
});

exports.removePaymentMethod = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await stripe.paymentMethods.detach(id);

  res.json({
    success: true,
    message: 'Payment method removed successfully'
  });
});

exports.getInvoices = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const customer = await getOrCreateStripeCustomer(req.user);
  
  const invoices = await stripe.invoices.list({
    customer: customer.id,
    limit: limit,
    starting_after: page > 1 ? invoices?.data[invoices.data.length - 1]?.id : undefined
  });

  res.json({
    success: true,
    invoices: invoices.data,
    hasMore: invoices.has_more
  });
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const customer = await getOrCreateStripeCustomer(req.user);
  
  const invoice = await stripe.invoices.retrieve(id);

  res.json({
    success: true,
    invoice
  });
});

exports.payInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const customer = await getOrCreateStripeCustomer(req.user);
  
  const invoice = await stripe.invoices.pay(id);

  res.json({
    success: true,
    invoice
  });
});

exports.getUsage = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  });

  if (!subscription) {
    return next(new AppError('No active subscription found', 404));
  }

  // Calculate actual usage
  const usage = {
    properties: 0, // TODO: Calculate actual properties
    applications: 0, // TODO: Calculate actual applications
    storage: 0 // TODO: Calculate actual storage usage
  };

  res.json({
    success: true,
    usage,
    limits: subscription.usage
  });
});

exports.getUsageMetric = catchAsync(async (req, res, next) => {
  const { metric } = req.params;

  const subscription = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  });

  if (!subscription) {
    return next(new AppError('No active subscription found', 404));
  }

  const usage = await exports.getUsage(req, res, next);
  
  if (usage.usage && usage.usage[metric] !== undefined) {
    res.json({
      success: true,
      metric,
      current: usage.usage[metric].current,
      limit: usage.usage[metric].limit
    });
  } else {
    return next(new AppError('Invalid metric', 400));
  }
});

// Admin functions
exports.getAllSubscriptions = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, plan } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (plan) query.plan = plan;

  const subscriptions = await Subscription.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Subscription.countDocuments(query);

  res.json({
    success: true,
    subscriptions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('user', 'name email')
    .populate('paymentMethods')
    .populate('invoices');

  if (!subscription) {
    return next(new AppError('Subscription not found', 404));
  }

  res.json({
    success: true,
    subscription
  });
});

exports.updateSubscriptionAdmin = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const subscription = await Subscription.findById(id);
  if (!subscription) {
    return next(new AppError('Subscription not found', 404));
  }

  Object.keys(updates).forEach(key => {
    subscription[key] = updates[key];
  });

  await subscription.save();

  res.json({
    success: true,
    subscription
  });
});

exports.deleteSubscriptionAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const subscription = await Subscription.findById(id);
  if (!subscription) {
    return next(new AppError('Subscription not found', 404));
  }

  // Cancel Stripe subscription if active
  if (subscription.stripeSubscriptionId) {
    await stripe.subscriptions.del(subscription.stripeSubscriptionId);
  }

  await Subscription.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Subscription deleted successfully'
  });
});

// Helper functions
async function getPlanDetails(planId) {
  const plans = {
    basic: {
      stripePriceId: 'price_basic_monthly',
      amount: 2900,
      currency: 'usd',
      interval: 'month',
      intervalCount: 1,
      features: [
        { name: 'Properties', enabled: true, limit: 3 },
        { name: 'Applications', enabled: true, limit: 10 },
        { name: 'Storage', enabled: true, limit: 1000 }
      ],
      usage: {
        properties: { current: 0, limit: 3 },
        applications: { current: 0, limit: 10 },
        storage: { current: 0, limit: 1000 }
      }
    },
    pro: {
      stripePriceId: 'price_pro_monthly',
      amount: 9900,
      currency: 'usd',
      interval: 'month',
      intervalCount: 1,
      features: [
        { name: 'Properties', enabled: true, limit: 20 },
        { name: 'Applications', enabled: true, limit: 100 },
        { name: 'Storage', enabled: true, limit: 10000 }
      ],
      usage: {
        properties: { current: 0, limit: 20 },
        applications: { current: 0, limit: 100 },
        storage: { current: 0, limit: 10000 }
      }
    },
    enterprise: {
      stripePriceId: 'price_enterprise_monthly',
      amount: 29900,
      currency: 'usd',
      interval: 'month',
      intervalCount: 1,
      features: [
        { name: 'Properties', enabled: true, limit: -1 },
        { name: 'Applications', enabled: true, limit: -1 },
        { name: 'Storage', enabled: true, limit: 100000 }
      ],
      usage: {
        properties: { current: 0, limit: -1 },
        applications: { current: 0, limit: -1 },
        storage: { current: 0, limit: 100000 }
      }
    }
  };

  return plans[planId];
}

async function getOrCreateStripeCustomer(user) {
  let customer;

  // Check if user already has a Stripe customer ID
  if (user.stripeCustomerId) {
    customer = await stripe.customers.retrieve(user.stripeCustomerId);
  } else {
    // Create new Stripe customer
    customer = await stripe.customers.create({
      email: user.email,
      name: `${user.name.first} ${user.name.last}`,
      metadata: {
        userId: user._id.toString()
      }
    });

    // Save customer ID to user
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  return customer;
}

// Methods are already exported with exports syntax
