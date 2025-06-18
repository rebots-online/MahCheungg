const express = require('express');
const router = express.Router();
const axios = require('axios');

// Create an invoice using BTCPay Server API
router.post('/btcpay/invoices', async (req, res) => {
  const { price, currency = 'USD', metadata = {} } = req.body;
  try {
    const response = await axios.post(
      `${process.env.BTCPAY_URL}/api/v1/stores/${process.env.BTCPAY_STORE_ID}/invoices`,
      {
        amount: price,
        currency,
        metadata,
      },
      {
        headers: {
          Authorization: `token ${process.env.BTCPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('BTCPay invoice error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;
