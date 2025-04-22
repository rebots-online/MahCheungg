# MahCheungg Server

This is the backend server for the MahCheungg application, handling payment processing, authentication, and subscription management.

## Features

- Stripe integration for payment processing
- RevenueCat integration for subscription management
- Firebase authentication
- RESTful API endpoints

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your API keys
4. Start the server:
   ```
   npm start
   ```

## Development

For development with hot reloading:
```
npm run dev
```

## API Endpoints

### Stripe

- `POST /api/create-payment-intent`: Create a payment intent
- `POST /api/create-subscription`: Create a subscription
- `POST /api/cancel-subscription`: Cancel a subscription
- `POST /api/update-subscription`: Update a subscription
- `GET /api/subscription-status`: Get subscription status
- `POST /api/create-customer`: Create a customer
- `GET /api/payment-methods`: Get payment methods
- `POST /api/add-payment-method`: Add a payment method
- `POST /api/remove-payment-method`: Remove a payment method
- `POST /api/webhook`: Stripe webhook endpoint

### RevenueCat

- `GET /api/revenuecat/subscribers/:appUserId`: Get subscriber information
- `POST /api/revenuecat/subscribers/:appUserId`: Create or update subscriber
- `GET /api/revenuecat/subscribers/:appUserId/subscriptions`: Get subscriber subscriptions
- `GET /api/revenuecat/offerings`: Get offerings
- `POST /api/revenuecat/subscribers/:appUserId/entitlements/:entitlementId/grant`: Grant entitlement
- `POST /api/revenuecat/subscribers/:appUserId/entitlements/:entitlementId/revoke`: Revoke entitlement
- `POST /api/revenuecat/webhook`: RevenueCat webhook endpoint

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login
- `GET /api/auth/profile`: Get user profile
- `PUT /api/auth/profile`: Update user profile

## Environment Variables

- `PORT`: Server port (default: 3001)
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `REVENUECAT_API_KEY`: RevenueCat API key
- `REVENUECAT_WEBHOOK_SECRET`: RevenueCat webhook secret
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Firebase client email
