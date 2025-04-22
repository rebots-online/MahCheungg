# RevenueCat MCP Server

This is a Model Context Protocol (MCP) server for RevenueCat, allowing AI assistants to interact with the RevenueCat API for subscription management.

## Features

- Create and manage subscriptions
- Check subscription status
- Handle subscription events
- Manage customers
- Generate entitlement reports

## Installation

```bash
pip install mcp-revenuecat
```

## Configuration

Create a `.env` file with your RevenueCat API keys:

```
REVENUECAT_API_KEY=your_api_key
REVENUECAT_PUBLIC_KEY=your_public_key
```

## Usage

Start the server:

```bash
python -m mcp_revenuecat.server
```

## API Endpoints

The server exposes the following MCP endpoints:

- `GET /tools`: Get the available tools
- `POST /run`: Run a tool

## Tools

### Customers

- `get_customer`: Get customer information
- `create_customer`: Create a new customer
- `identify_customer`: Identify a customer with app user ID
- `delete_customer`: Delete a customer

### Subscriptions

- `get_subscription`: Get subscription information
- `create_subscription`: Create a new subscription
- `cancel_subscription`: Cancel a subscription
- `defer_subscription`: Defer a subscription renewal
- `refund_subscription`: Refund a subscription

### Offerings

- `get_offerings`: Get available offerings
- `create_offering`: Create a new offering
- `update_offering`: Update an offering

### Entitlements

- `check_entitlement`: Check if a customer has an entitlement
- `grant_entitlement`: Grant an entitlement to a customer
- `revoke_entitlement`: Revoke an entitlement from a customer

### Analytics

- `get_subscriber_counts`: Get subscriber counts
- `get_mrr`: Get monthly recurring revenue
- `get_revenue`: Get revenue for a period

## License

MIT
