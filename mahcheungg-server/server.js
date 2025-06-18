const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe
const stripeClient = process.env.STRIPE_SECRET_KEY ?
  stripe(process.env.STRIPE_SECRET_KEY) :
  stripe('sk_test_51OxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'); // Placeholder key

// Initialize Firebase Admin (commented out until you have proper credentials)
/*
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
*/

// Import routes
const stripeRoutes = require('./routes/stripe');
const revenueCatRoutes = require('./routes/revenueCat');
const authRoutes = require('./routes/auth');
const btcpayRoutes = require('./routes/btcpay');
const weblnAuthRoutes = require('./routes/weblnAuth');

// Use routes
app.use('/api', stripeRoutes);
app.use('/api', revenueCatRoutes);
app.use('/api', authRoutes);
app.use('/api', btcpayRoutes);
app.use('/api', weblnAuthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'MahCheungg API Server', version: '1.0.0' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
