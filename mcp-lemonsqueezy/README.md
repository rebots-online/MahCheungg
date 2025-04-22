# LemonSqueezy MCP Server

This is a Model Context Protocol (MCP) server for LemonSqueezy, allowing AI assistants to interact with the LemonSqueezy API for subscription and payment management.

## Features

- Create and manage subscriptions
- Process payments
- Handle webhooks
- Manage products and pricing
- Generate reports

## Installation

```bash
pip install mcp-lemonsqueezy
```

## Configuration

Create a `.env` file with your LemonSqueezy API keys:

```
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

## Usage

Start the server:

```bash
python -m mcp_lemonsqueezy.server
```

## API Endpoints

The server exposes the following MCP endpoints:

- `GET /tools`: Get the available tools
- `POST /run`: Run a tool

## Tools

### Customers

- `get_customer`: Get customer information
- `list_customers`: List all customers
- `create_customer`: Create a new customer
- `update_customer`: Update a customer

### Subscriptions

- `get_subscription`: Get subscription information
- `list_subscriptions`: List all subscriptions
- `create_subscription`: Create a new subscription
- `update_subscription`: Update a subscription
- `cancel_subscription`: Cancel a subscription
- `pause_subscription`: Pause a subscription
- `resume_subscription`: Resume a subscription

### Products

- `get_product`: Get product information
- `list_products`: List all products
- `create_product`: Create a new product
- `update_product`: Update a product

### Variants

- `get_variant`: Get variant information
- `list_variants`: List all variants
- `create_variant`: Create a new variant
- `update_variant`: Update a variant

### Orders

- `get_order`: Get order information
- `list_orders`: List all orders
- `create_order`: Create a new order
- `refund_order`: Refund an order

### Checkouts

- `create_checkout`: Create a new checkout
- `get_checkout`: Get checkout information

### Webhooks

- `list_webhooks`: List all webhooks
- `create_webhook`: Create a new webhook
- `update_webhook`: Update a webhook
- `delete_webhook`: Delete a webhook

### Reports

- `get_earnings`: Get earnings report
- `get_sales`: Get sales report
- `get_subscriptions_report`: Get subscriptions report

## License

MIT
