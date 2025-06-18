import os
import json
import logging
import requests
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API keys from environment variables
REVENUECAT_API_KEY = os.getenv("REVENUECAT_API_KEY")
REVENUECAT_PUBLIC_KEY = os.getenv("REVENUECAT_PUBLIC_KEY")

# RevenueCat API base URL
REVENUECAT_API_BASE = "https://api.revenuecat.com/v1"

# Helper function for making API requests
def make_api_request(method, endpoint, data=None, params=None):
    """Make an API request to RevenueCat."""
    url = f"{REVENUECAT_API_BASE}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {REVENUECAT_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"API request error: {str(e)}")
        if hasattr(e, "response") and e.response is not None:
            try:
                error_data = e.response.json()
                return {"error": error_data}
            except:
                return {"error": str(e)}
        return {"error": str(e)}

# Customer functions
def get_customer(app_user_id: str):
    """Get customer information."""
    return make_api_request("GET", f"subscribers/{app_user_id}")

def create_customer(app_user_id: str, attributes: Optional[Dict[str, Any]] = None):
    """Create a new customer."""
    data = {"attributes": attributes} if attributes else {}
    return make_api_request("POST", f"subscribers/{app_user_id}", data=data)

def identify_customer(app_user_id: str, new_app_user_id: str):
    """Identify a customer with app user ID."""
    data = {"new_app_user_id": new_app_user_id}
    return make_api_request("POST", f"subscribers/{app_user_id}/alias", data=data)

def delete_customer(app_user_id: str):
    """Delete a customer."""
    return make_api_request("DELETE", f"subscribers/{app_user_id}")

# Subscription functions
def get_subscription(app_user_id: str):
    """Get subscription information."""
    return make_api_request("GET", f"subscribers/{app_user_id}/subscriptions")

def create_subscription(app_user_id: str, product_id: str, price_id: str, currency: str, payment_mode: str = "standard"):
    """Create a new subscription."""
    data = {
        "product_id": product_id,
        "price_id": price_id,
        "currency": currency,
        "payment_mode": payment_mode
    }
    return make_api_request("POST", f"subscribers/{app_user_id}/subscriptions", data=data)

def cancel_subscription(app_user_id: str, product_id: str):
    """Cancel a subscription."""
    return make_api_request("POST", f"subscribers/{app_user_id}/subscriptions/{product_id}/cancel")

def defer_subscription(app_user_id: str, product_id: str, expiry_time_ms: int):
    """Defer a subscription renewal."""
    data = {"expiry_time_ms": expiry_time_ms}
    return make_api_request("POST", f"subscribers/{app_user_id}/subscriptions/{product_id}/defer", data=data)

def refund_subscription(app_user_id: str, product_id: str):
    """Refund a subscription."""
    return make_api_request("POST", f"subscribers/{app_user_id}/subscriptions/{product_id}/refund")

# Offerings functions
def get_offerings():
    """Get available offerings."""
    return make_api_request("GET", "offerings")

def create_offering(offering_id: str, description: str, packages: List[Dict[str, Any]]):
    """Create a new offering."""
    data = {
        "description": description,
        "packages": packages
    }
    return make_api_request("POST", f"offerings/{offering_id}", data=data)

def update_offering(offering_id: str, description: str, packages: List[Dict[str, Any]]):
    """Update an offering."""
    data = {
        "description": description,
        "packages": packages
    }
    return make_api_request("PUT", f"offerings/{offering_id}", data=data)

# Entitlements functions
def check_entitlement(app_user_id: str, entitlement_id: str):
    """Check if a customer has an entitlement."""
    return make_api_request("GET", f"subscribers/{app_user_id}/entitlements/{entitlement_id}")

def grant_entitlement(app_user_id: str, entitlement_id: str, duration: int):
    """Grant an entitlement to a customer."""
    data = {"duration": duration}
    return make_api_request("POST", f"subscribers/{app_user_id}/entitlements/{entitlement_id}/grant", data=data)

def revoke_entitlement(app_user_id: str, entitlement_id: str):
    """Revoke an entitlement from a customer."""
    return make_api_request("POST", f"subscribers/{app_user_id}/entitlements/{entitlement_id}/revoke")

# Analytics functions
def get_subscriber_counts(period: str = "month"):
    """Get subscriber counts."""
    params = {"period": period}
    return make_api_request("GET", "analytics/subscriber_counts", params=params)

def get_mrr():
    """Get monthly recurring revenue."""
    return make_api_request("GET", "analytics/mrr")

def get_revenue(period: str = "month"):
    """Get revenue for a period."""
    params = {"period": period}
    return make_api_request("GET", "analytics/revenue", params=params)

# Define tools
TOOLS = [
    {
        "name": "get_customer",
        "description": "Get customer information from RevenueCat",
        "function": "mcp_revenuecat.tools.get_customer",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            }
        }
    },
    {
        "name": "create_customer",
        "description": "Create a new customer in RevenueCat",
        "function": "mcp_revenuecat.tools.create_customer",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "attributes": {
                "type": "object",
                "description": "Customer attributes",
                "required": False
            }
        }
    },
    {
        "name": "identify_customer",
        "description": "Identify a customer with app user ID in RevenueCat",
        "function": "mcp_revenuecat.tools.identify_customer",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The current app user ID of the customer"
            },
            "new_app_user_id": {
                "type": "string",
                "description": "The new app user ID to associate with the customer"
            }
        }
    },
    {
        "name": "delete_customer",
        "description": "Delete a customer from RevenueCat",
        "function": "mcp_revenuecat.tools.delete_customer",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            }
        }
    },
    {
        "name": "get_subscription",
        "description": "Get subscription information from RevenueCat",
        "function": "mcp_revenuecat.tools.get_subscription",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            }
        }
    },
    {
        "name": "create_subscription",
        "description": "Create a new subscription in RevenueCat",
        "function": "mcp_revenuecat.tools.create_subscription",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "product_id": {
                "type": "string",
                "description": "The product ID"
            },
            "price_id": {
                "type": "string",
                "description": "The price ID"
            },
            "currency": {
                "type": "string",
                "description": "The currency code (e.g., USD)"
            },
            "payment_mode": {
                "type": "string",
                "description": "The payment mode (standard or test)",
                "required": False
            }
        }
    },
    {
        "name": "cancel_subscription",
        "description": "Cancel a subscription in RevenueCat",
        "function": "mcp_revenuecat.tools.cancel_subscription",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "product_id": {
                "type": "string",
                "description": "The product ID"
            }
        }
    },
    {
        "name": "defer_subscription",
        "description": "Defer a subscription renewal in RevenueCat",
        "function": "mcp_revenuecat.tools.defer_subscription",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "product_id": {
                "type": "string",
                "description": "The product ID"
            },
            "expiry_time_ms": {
                "type": "integer",
                "description": "The new expiry time in milliseconds since epoch"
            }
        }
    },
    {
        "name": "refund_subscription",
        "description": "Refund a subscription in RevenueCat",
        "function": "mcp_revenuecat.tools.refund_subscription",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "product_id": {
                "type": "string",
                "description": "The product ID"
            }
        }
    },
    {
        "name": "get_offerings",
        "description": "Get available offerings from RevenueCat",
        "function": "mcp_revenuecat.tools.get_offerings",
        "parameters": {}
    },
    {
        "name": "create_offering",
        "description": "Create a new offering in RevenueCat",
        "function": "mcp_revenuecat.tools.create_offering",
        "parameters": {
            "offering_id": {
                "type": "string",
                "description": "The offering ID"
            },
            "description": {
                "type": "string",
                "description": "The offering description"
            },
            "packages": {
                "type": "array",
                "description": "The packages in the offering"
            }
        }
    },
    {
        "name": "update_offering",
        "description": "Update an offering in RevenueCat",
        "function": "mcp_revenuecat.tools.update_offering",
        "parameters": {
            "offering_id": {
                "type": "string",
                "description": "The offering ID"
            },
            "description": {
                "type": "string",
                "description": "The offering description"
            },
            "packages": {
                "type": "array",
                "description": "The packages in the offering"
            }
        }
    },
    {
        "name": "check_entitlement",
        "description": "Check if a customer has an entitlement in RevenueCat",
        "function": "mcp_revenuecat.tools.check_entitlement",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "entitlement_id": {
                "type": "string",
                "description": "The entitlement ID"
            }
        }
    },
    {
        "name": "grant_entitlement",
        "description": "Grant an entitlement to a customer in RevenueCat",
        "function": "mcp_revenuecat.tools.grant_entitlement",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "entitlement_id": {
                "type": "string",
                "description": "The entitlement ID"
            },
            "duration": {
                "type": "integer",
                "description": "The duration in seconds"
            }
        }
    },
    {
        "name": "revoke_entitlement",
        "description": "Revoke an entitlement from a customer in RevenueCat",
        "function": "mcp_revenuecat.tools.revoke_entitlement",
        "parameters": {
            "app_user_id": {
                "type": "string",
                "description": "The app user ID of the customer"
            },
            "entitlement_id": {
                "type": "string",
                "description": "The entitlement ID"
            }
        }
    },
    {
        "name": "get_subscriber_counts",
        "description": "Get subscriber counts from RevenueCat",
        "function": "mcp_revenuecat.tools.get_subscriber_counts",
        "parameters": {
            "period": {
                "type": "string",
                "description": "The period (day, week, month, year)",
                "required": False
            }
        }
    },
    {
        "name": "get_mrr",
        "description": "Get monthly recurring revenue from RevenueCat",
        "function": "mcp_revenuecat.tools.get_mrr",
        "parameters": {}
    },
    {
        "name": "get_revenue",
        "description": "Get revenue for a period from RevenueCat",
        "function": "mcp_revenuecat.tools.get_revenue",
        "parameters": {
            "period": {
                "type": "string",
                "description": "The period (day, week, month, year)",
                "required": False
            }
        }
    }
]
