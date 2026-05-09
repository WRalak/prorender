const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.handleStripeWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    return next(new AppError('No Stripe signature', 400));
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    return next(new AppError(`Webhook signature verification failed: ${err.message}`, 400));
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

exports.handleDocuSignWebhook = catchAsync(async (req, res, next) => {
  const { event } = req.body;

  switch (event) {
    case 'signature_request_signed':
      await handleDocuSignSigned(event.data);
      break;
    case 'envelope_delivered':
      await handleDocuSignDelivered(event.data);
      break;
    case 'envelope_completed':
      await handleDocuSignCompleted(event.data);
      break;
    default:
      console.log(`Unhandled DocuSign event: ${event}`);
  }

  res.json({ received: true });
});

exports.handleEmailWebhook = catchAsync(async (req, res, next) => {
  const { event, data } = req.body;

  switch (event) {
    case 'email.delivered':
      await handleEmailDelivered(data);
      break;
    case 'email.bounced':
      await handleEmailBounced(data);
      break;
    case 'email.complained':
      await handleEmailComplained(data);
      break;
    default:
      console.log(`Unhandled email event: ${event}`);
  }

  res.json({ received: true });
});

exports.handleCloudinaryWebhook = catchAsync(async (req, res, next) => {
  const { notification_type, resource } = req.body;

  switch (notification_type) {
    case 'resource_created':
      await handleCloudinaryResourceCreated(resource);
      break;
    case 'resource_deleted':
      await handleCloudinaryResourceDeleted(resource);
      break;
    default:
      console.log(`Unhandled Cloudinary event: ${notification_type}`);
  }

  res.json({ received: true });
});

exports.handleCustomWebhook = catchAsync(async (req, res, next) => {
  const { event } = req.params;
  const data = req.body;

  console.log(`Custom webhook event: ${event}`, data);
  // TODO: Handle custom webhook events based on event type
  res.json({ received: true });
});

// Helper functions for Stripe webhooks
async function handlePaymentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  // Update payment status in database
  const payment = await Payment.findOne({ transactionId: paymentIntent.id });
  if (payment) {
    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save();
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Update payment status in database
  const payment = await Payment.findOne({ transactionId: paymentIntent.id });
  if (payment) {
    payment.status = 'failed';
    payment.failureReason = paymentIntent.last_payment_error?.message;
    await payment.save();
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  // Update subscription if applicable
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
    }
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);
  // Update subscription if applicable
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
    }
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  // Update local subscription record
  const localSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (localSubscription) {
    localSubscription.status = 'active';
    localSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    localSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await localSubscription.save();
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  // Update local subscription record
  const localSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (localSubscription) {
    localSubscription.status = subscription.status;
    localSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    localSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    localSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    await localSubscription.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  // Update local subscription record
  const localSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (localSubscription) {
    localSubscription.status = 'canceled';
    localSubscription.endedAt = new Date();
    await localSubscription.save();
  }
}

// Helper functions for DocuSign webhooks
async function handleDocuSignSigned(data) {
  console.log('DocuSign document signed:', data);
  // TODO: Update lease signature status
}

async function handleDocuSignDelivered(data) {
  console.log('DocuSign document delivered:', data);
  // TODO: Update notification status
}

async function handleDocuSignCompleted(data) {
  console.log('DocuSign document completed:', data);
  // TODO: Update lease status to fully signed
}

// Helper functions for email webhooks
async function handleEmailDelivered(data) {
  console.log('Email delivered:', data);
  // TODO: Update email delivery status
}

async function handleEmailBounced(data) {
  console.log('Email bounced:', data);
  // TODO: Handle bounced email
}

async function handleEmailComplained(data) {
  console.log('Email complained:', data);
  // TODO: Handle email complaint
}

// Helper functions for Cloudinary webhooks
async function handleCloudinaryResourceCreated(resource) {
  console.log('Cloudinary resource created:', resource);
  // TODO: Update file records
}

async function handleCloudinaryResourceDeleted(resource) {
  console.log('Cloudinary resource deleted:', resource);
  // TODO: Update file records
}

module.exports = {
  handleStripeWebhook,
  handleDocuSignWebhook,
  handleEmailWebhook,
  handleCloudinaryWebhook,
  handleCustomWebhook
};
