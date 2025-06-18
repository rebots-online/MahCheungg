import os
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API keys from environment variables
REVENUECAT_API_KEY = os.getenv("REVENUECAT_API_KEY")
REVENUECAT_PUBLIC_KEY = os.getenv("REVENUECAT_PUBLIC_KEY")

if not REVENUECAT_API_KEY:
    logger.warning("REVENUECAT_API_KEY not set. Some functionality may be limited.")

# Create FastAPI app
app = FastAPI(title="RevenueCat MCP Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models
class ToolCall(BaseModel):
    name: str
    parameters: Dict[str, Any]

class RunRequest(BaseModel):
    tool_calls: List[ToolCall]

class RunResponse(BaseModel):
    results: List[Dict[str, Any]]

# RevenueCat API base URL
REVENUECAT_API_BASE = "https://api.revenuecat.com/v1"

# Define tools
from .tools import TOOLS

@app.get("/tools")
async def get_tools():
    """Get the available tools."""
    return {"tools": TOOLS}

@app.post("/run")
async def run_tool(request: RunRequest):
    """Run a tool."""
    results = []

    for tool_call in request.tool_calls:
        tool_name = tool_call.name
        parameters = tool_call.parameters

        # Find the tool
        tool = next((t for t in TOOLS if t["name"] == tool_name), None)
        if not tool:
            raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")

        try:
            # Import the function
            module_name, function_name = tool["function"].rsplit(".", 1)
            module = __import__(module_name, fromlist=[function_name])
            function = getattr(module, function_name)

            # Call the function
            result = function(**parameters)
            results.append({"result": result})
        except Exception as e:
            logger.error(f"Error running tool '{tool_name}': {str(e)}")
            results.append({"error": str(e)})

    return {"results": results}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

def start():
    """Start the server."""
    uvicorn.run("mcp_revenuecat.server:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start()
