const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Simple in-memory nonce store (for demo only)
const nonces = new Map();

// Generate a nonce for client to sign
router.get('/webln/nonce', (req, res) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  nonces.set(nonce, Date.now());
  res.status(200).json({ nonce });
});

// Verify signature and return a custom token placeholder
router.post('/webln/verify', async (req, res) => {
  const { address, signature, nonce } = req.body;
  if (!nonces.has(nonce)) {
    return res.status(400).json({ error: 'Invalid nonce' });
  }
  nonces.delete(nonce);
  try {
    // In a real implementation you'd verify the signature here
    // using secp256k1 or your chosen lightning auth scheme.
    console.log(`Verify signature for ${address}: ${signature}`);
    // Generate a mock token for Firebase/Supabase
    const token = `mock-${crypto.randomBytes(8).toString('hex')}`;
    res.status(200).json({ token });
  } catch (error) {
    console.error('WebLN verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
