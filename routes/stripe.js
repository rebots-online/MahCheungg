const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { priceId, customerId } = req.body;
    
    // If no customer ID is provided, create a new customer
    let customer;
    if (!customerId) {
      customer = await stripe.customers.create();
    } else {
      customer = { id: customerId };
    }
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel a subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    
    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a subscription
router.post('/update-subscription', async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
router.get('/subscription-status', async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Map subscription status to tier
    let tier = 'free_tier';
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      // This is a simplified example - in a real app, you would determine the tier based on the price ID
      const priceId = subscription.items.data[0].price.id;
      if (priceId.includes('premium')) {
        tier = 'premium_tier';
      } else if (priceId.includes('standard')) {
        tier = 'standard_tier';
      }
    }
    
    res.status(200).json({
      status: subscription.status,
      tier,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a customer
router.post('/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const customer = await stripe.customers.create({
      email,
      name,
    });
    
    res.status(200).json({
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const { customerId } = req.query;
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    res.status(200).json(paymentMethods.data);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add payment method
router.post('/add-payment-method', async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.body;
    
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove payment method
router.post('/remove-payment-method', async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    await stripe.paymentMethods.detach(paymentMethodId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Handle subscription events
      console.log(`Subscription ${event.type}:`, subscription.id);
      break;
    case 'invoice.paid':
      const invoice = event.data.object;
      // Handle successful payment
      console.log('Invoice paid:', invoice.id);
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Handle failed payment
      console.log('Invoice payment failed:', failedInvoice.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.status(200).json({ received: true });
});

module.exports = router;
