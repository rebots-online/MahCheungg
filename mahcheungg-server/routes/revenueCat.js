const express = require('express');
const router = express.Router();
const axios = require('axios');

// RevenueCat API base URL
const REVENUECAT_API_BASE = 'https://api.revenuecat.com/v1';

// Helper function for making API requests to RevenueCat
const makeRevenueCatRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const url = `${REVENUECAT_API_BASE}/${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${process.env.REVENUECAT_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    let response;
    if (method === 'GET') {
      response = await axios.get(url, { headers, params });
    } else if (method === 'POST') {
      response = await axios.post(url, data, { headers });
    } else if (method === 'PUT') {
      response = await axios.put(url, data, { headers });
    } else if (method === 'DELETE') {
      response = await axios.delete(url, { headers });
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response.data;
  } catch (error) {
    console.error('RevenueCat API request error:', error.response?.data || error.message);
    throw error;
  }
};

// Get subscriber information
router.get('/revenuecat/subscribers/:appUserId', async (req, res) => {
  try {
    const { appUserId } = req.params;
    const data = await makeRevenueCatRequest('GET', `subscribers/${appUserId}`);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Create or update subscriber
router.post('/revenuecat/subscribers/:appUserId', async (req, res) => {
  try {
    const { appUserId } = req.params;
    const { attributes } = req.body;
    const data = await makeRevenueCatRequest('POST', `subscribers/${appUserId}`, { attributes });
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Get subscriber subscriptions
router.get('/revenuecat/subscribers/:appUserId/subscriptions', async (req, res) => {
  try {
    const { appUserId } = req.params;
    const data = await makeRevenueCatRequest('GET', `subscribers/${appUserId}/subscriptions`);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Get offerings
router.get('/revenuecat/offerings', async (req, res) => {
  try {
    const data = await makeRevenueCatRequest('GET', 'offerings');
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Grant entitlement
router.post('/revenuecat/subscribers/:appUserId/entitlements/:entitlementId/grant', async (req, res) => {
  try {
    const { appUserId, entitlementId } = req.params;
    const { duration } = req.body;
    const data = await makeRevenueCatRequest('POST', `subscribers/${appUserId}/entitlements/${entitlementId}/grant`, { duration });
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Revoke entitlement
router.post('/revenuecat/subscribers/:appUserId/entitlements/:entitlementId/revoke', async (req, res) => {
  try {
    const { appUserId, entitlementId } = req.params;
    const data = await makeRevenueCatRequest('POST', `subscribers/${appUserId}/entitlements/${entitlementId}/revoke`);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// RevenueCat webhook
router.post('/revenuecat/webhook', express.json(), async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-revenuecat-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing RevenueCat signature' });
    }

    // In a real implementation, you would verify the signature using the webhook secret
    // For now, we'll just log the event
    console.log('RevenueCat webhook event:', req.body);

    // Handle the event based on its type
    const event = req.body;
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
      case 'CANCELLATION':
      case 'UNCANCELLATION':
      case 'BILLING_ISSUE':
      case 'SUBSCRIBER_ALIAS':
        // Handle the event
        console.log(`Handling RevenueCat event: ${event.type}`);
        break;
      default:
        console.log(`Unhandled RevenueCat event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
