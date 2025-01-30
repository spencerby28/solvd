from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import json
from typing import Optional, Dict, List
import os
from enum import Enum
from dotenv import load_dotenv
import logging
from datetime import datetime
import aiofiles

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Shopify Bulk Operations API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
PUBLIC_SERVER_URL = "https://py-server.hotshotdev.com"
SHOPIFY_SHOP_NAME = os.getenv("SHOPIFY_SHOP_NAME")
SHOPIFY_ACCESS_TOKEN = os.getenv("SHOPIFY_ACCESS_TOKEN")
SHOPIFY_API_VERSION = "2025-01"  # Update as needed

SHOPIFY_ADMIN_URL = f"https://{SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/{SHOPIFY_API_VERSION}/graphql.json"

class BulkOperationStatus(str, Enum):
    CREATED = "CREATED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELED = "CANCELED"

class BulkOperation(BaseModel):
    id: str  # ID! (non-null)
    status: BulkOperationStatus  # BulkOperationStatus! (non-null)
    query: str  # String! (non-null)
    createdAt: str  # DateTime! (non-null)
    objectCount: int  # UnsignedInt64! (non-null)
    rootObjectCount: int  # UnsignedInt64! (non-null)
    type: str  # BulkOperationType! (non-null)
    
    # Optional fields
    completedAt: Optional[str] = None  # DateTime
    errorCode: Optional[str] = None  # BulkOperationErrorCode
    fileSize: Optional[int] = None  # UnsignedInt64
    url: Optional[str] = None  # URL
    partialDataUrl: Optional[str] = None  # URL

    class Config:
        from_attributes = True

class WebhookSubscription(BaseModel):
    id: str
    topic: str
    format: str
    callbackUrl: str

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Change from absolute path to project-relative path
DATA_DIR = os.path.join(os.path.dirname(__file__), "bulk")
os.makedirs(DATA_DIR, exist_ok=True)

async def execute_graphql_query(query: str, variables: Dict = None) -> Dict:
    """Execute a GraphQL query against Shopify Admin API"""
    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SHOPIFY_ADMIN_URL,
            json={"query": query, "variables": variables},
            headers=headers
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Shopify API request failed")
        
        return response.json()

@app.post("/bulk-operations/query", response_model=BulkOperation)
async def start_bulk_operation(query: str):
    """Start a new bulk operation query"""
    mutation = """
    mutation {
        bulkOperationRunQuery(
            query: \"\"\"
                %s
            \"\"\"
        ) {
            bulkOperation {
                id
                status
                query
                createdAt
                objectCount
                rootObjectCount
                type
                completedAt
                errorCode
                fileSize
                url
                partialDataUrl
            }
            userErrors {
                field
                message
                code
            }
        }
    }
    """ % query
    
    result = await execute_graphql_query(mutation)
    
    if "errors" in result:
        raise HTTPException(status_code=400, detail=result["errors"])
    
    if result["data"]["bulkOperationRunQuery"]["userErrors"]:
        raise HTTPException(
            status_code=400,
            detail=result["data"]["bulkOperationRunQuery"]["userErrors"]
        )
    
    bulk_operation = result["data"]["bulkOperationRunQuery"]["bulkOperation"]
    return BulkOperation(**bulk_operation)

@app.get("/bulk-operations/status", response_model=BulkOperation)
async def get_bulk_operation_status():
    """Get the status of the current bulk operation"""
    query = """
    query {
        currentBulkOperation {
            id
            status
            query
            createdAt
            objectCount
            rootObjectCount
            type
            completedAt
            errorCode
            fileSize
            url
            partialDataUrl
        }
    }
    """
    
    result = await execute_graphql_query(query)
    
    if "errors" in result:
        raise HTTPException(status_code=400, detail=result["errors"])
    
    current_operation = result["data"]["currentBulkOperation"]
    return BulkOperation(**current_operation)

@app.post("/bulk-operations/cancel/{operation_id}")
async def cancel_bulk_operation(operation_id: str):
    """Cancel a running bulk operation"""
    mutation = """
    mutation {
        bulkOperationCancel(id: "%s") {
            bulkOperation {
                status
            }
            userErrors {
                field
                message
            }
        }
    }
    """ % operation_id
    
    result = await execute_graphql_query(mutation)
    
    if "errors" in result:
        raise HTTPException(status_code=400, detail=result["errors"])
    
    return {"status": "Operation cancelled"}

# Example product query endpoint
@app.post("/bulk-operations/products")
async def query_all_products():
    """Start a bulk operation to fetch all products and poll for completion"""
    products_query = """
    {
        products {
            edges {
                node {
                    id
                    title
                    handle
                    description
                    descriptionHtml
                    productType
                    vendor
                    status
                    createdAt
                    updatedAt
                    publishedAt
                    tags
                    priceRangeV2 {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                        maxVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    images(first: 10) {
                        edges {
                            node {
                                id
                                url
                                altText
                                width
                                height
                            }
                        }
                    }
                    variants(first: 100) {
                        edges {
                            node {
                                id
                                title
                                sku
                                price
                                compareAtPrice
                                inventoryQuantity
                                inventoryPolicy
                                barcode
                                availableForSale
                                taxable
                                position
                                selectedOptions {
                                    name
                                    value
                                }
                            }
                        }
                    }
                    options {
                        id
                        name
                        values
                    }
                    metafields(first: 10) {
                        edges {
                            node {
                                id
                                namespace
                                key
                                value
                                type
                            }
                        }
                    }
                }
            }
        }
    }
    """
    
    # Start the bulk operation
    bulk_operation = await start_bulk_operation(products_query)
    logger.info(f"Started bulk operation with ID: {bulk_operation.id}")
    
    # Poll for completion
    while True:
        await asyncio.sleep(5)  # Wait 5 seconds between checks
        status = await get_bulk_operation_status()
        logger.info(f"Bulk operation status: {status.status}")
        
        if status.status == BulkOperationStatus.COMPLETED:
            # Download the file when complete
            if status.url:
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.get(status.url)
                        response.raise_for_status()
                        
                        operation_number = status.id.split('/')[-1]
                        filename = f"bulk-{operation_number}.jsonl"
                        filepath = os.path.join(DATA_DIR, filename)
                        
                        async with aiofiles.open(filepath, 'wb') as f:
                            await f.write(response.content)
                        
                        logger.info(f"Bulk operation data saved to {filepath}")
                        return {
                            "status": "success",
                            "message": f"Data saved to {filename}",
                            "operation_id": status.id,
                            "file_size": status.fileSize,
                            "object_count": status.objectCount,
                            "root_object_count": status.rootObjectCount
                        }
                except Exception as e:
                    error_msg = f"Error saving bulk operation data: {str(e)}"
                    logger.error(error_msg)
                    raise HTTPException(status_code=500, detail=error_msg)
            else:
                error_msg = "No download URL available"
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)
        
        elif status.status in [BulkOperationStatus.FAILED, BulkOperationStatus.CANCELED]:
            error_msg = f"Bulk operation failed with status: {status.status}"
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
