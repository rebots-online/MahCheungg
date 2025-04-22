# MahCheungg Dev Build Checklist (20apr2025-12h30)

## Objective
Create a minimal but functional dev build of MahCheungg with working Stripe and RevenueCat integration for subscription management.

## Current Status
- Basic UI components implemented (Game Hub, Learning Center)
- WebLN integration for Bitcoin Lightning payments
- RevenueCat service implemented but not fully integrated
- Stripe integration implemented
- Internationalization and theme system in place

## Priority Tasks

### 1. Payment Integration
- [x] Install Stripe SDK
  ```bash
  cd mahcheungg-app && npm install @stripe/stripe-js @stripe/react-stripe-js
  ```
- [x] Create Stripe service
  - [x] Implement singleton pattern similar to RevenueCatService
  - [x] Add methods for creating payment intents
  - [x] Add methods for handling subscription creation
  - [x] Add webhook handling for subscription events
- [x] Update RevenueCatService
  - [x] Replace placeholder API key with environment variable
  - [x] Add proper error handling for production
  - [x] Implement subscription status synchronization
- [x] Create StripePaymentModal component
  - [x] Implement card element
  - [x] Add payment processing UI
  - [x] Handle success/failure states

### 2. Subscription Management
- [x] Create SubscriptionService to abstract payment providers
  - [x] Implement facade pattern over Stripe and RevenueCat
  - [x] Add methods for checking subscription status
  - [x] Add methods for upgrading/downgrading subscriptions
  - [x] Add methods for cancellation
- [x] Create SubscriptionManager component
  - [x] Display current subscription status
  - [x] Show upgrade/downgrade options
  - [x] Handle subscription changes
  - [x] Show payment history

### 3. User Authentication
- [/] Complete Firebase integration
  - [/] Implement email/password authentication
  - [/] Add social login options (Google)
  - [/] Create user profile management
  - [/] Link authentication with subscription status
- [/] Update AuthModal component
  - [/] Add registration form
  - [/] Improve login form
  - [/] Add password reset functionality

### 4. Backend Integration
- [x] Set up minimal Express.js server
  ```bash
  mkdir -p mahcheungg-server && cd mahcheungg-server && npm init -y && npm install express cors dotenv stripe firebase-admin
  ```
- [x] Create Stripe webhook endpoint
  - [x] Handle subscription events
  - [x] Update user subscription status
- [x] Create secure API endpoints
  - [x] User management
  - [x] Subscription management
  - [x] Payment processing

### 5. Game Functionality
- [x] Complete basic game mechanics
  - [x] Implement tile distribution
  - [x] Add player turns
  - [x] Implement basic game rules
- [x] Create minimal AI opponent
  - [x] Implement random but valid moves
  - [x] Add basic strategy for demonstration
- [x] Create game UI components
  - [x] Implement TileComponent for displaying tiles
  - [x] Create PlayerHandComponent for player hands
  - [x] Build GameBoardComponent for the game board
  - [x] Add GameControlsComponent for game actions
  - [x] Create GameSetupComponent for game configuration

### 6. Environment Configuration
- [x] Create .env files for development and production
  - [x] Add Stripe API keys
  - [x] Add RevenueCat API keys
  - [x] Add Firebase configuration
- [x] Update build scripts
  - [x] Add environment variable handling
  - [x] Configure production builds

### 7. Testing
- [ ] Test payment flows
  - [ ] Stripe card payments
  - [ ] RevenueCat integration
  - [ ] WebLN payments
- [ ] Test subscription management
  - [ ] Tier upgrades/downgrades
  - [ ] Cancellation
  - [ ] Restoration

### 8. Deployment
- [ ] Set up Netlify or Vercel for frontend
  - [ ] Configure build settings
  - [ ] Set up environment variables
- [ ] Deploy backend to Render or Railway
  - [ ] Configure environment variables
  - [ ] Set up webhook endpoints

## Implementation Plan

### Day 1 (Today)
1. [x] Install Stripe SDK
2. [x] Create StripeService implementation
3. [x] Create SubscriptionService abstraction
4. [x] Update RevenueCatService with proper configuration

### Day 2
1. [x] Create StripePaymentModal component
2. [x] Create SubscriptionManager component
3. [/] Complete Firebase authentication integration
4. [/] Update AuthModal component

### Day 3
1. [x] Set up minimal backend server
2. [x] Create Stripe webhook endpoint
3. [x] Create secure API endpoints
4. [x] Implement environment configuration

### Day 4
1. [x] Complete basic game mechanics
2. [x] Create minimal AI opponent
3. [x] Create game UI components
4. [ ] Test payment and subscription flows
5. [ ] Deploy frontend and backend

## Technical Considerations

### Stripe Integration
- Use Stripe Elements for secure card collection
- Implement Stripe Customer Portal for subscription management
- Use Stripe webhooks for subscription event handling
- Consider using Stripe Checkout for simplicity

### RevenueCat Integration
- Use RevenueCat for mobile app subscriptions
- Synchronize subscription status between Stripe and RevenueCat
- Use RevenueCat's observer mode when Stripe is the primary payment processor

### Authentication
- Use Firebase Authentication for user management
- Link authentication with subscription status
- Implement secure session management

### Environment Variables
- Use .env files for local development
- Use platform-specific environment variables for deployment
- Never commit API keys to the repository

## Resources
- [Stripe Documentation](https://stripe.com/docs)
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Express.js Documentation](https://expressjs.com/)
