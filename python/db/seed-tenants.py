from appwrite.client import Client
from appwrite.services.databases import Databases
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('PUBLIC_APPWRITE_ENDPOINT'))
client.set_project(os.getenv('PUBLIC_APPWRITE_PROJECT'))
client.set_key(os.getenv('APPWRITE_KEY'))

# Initialize database service
databases = Databases(client)

DATABASE_ID = 'tenants'

# Seed the database

# Core Identity Attributes
"""
databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='tenant_name',
    size=256,
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='avatar_url',
    size=1024,
    required=False,
)


databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='user_ids',
    array=True,
    size=36,  # Size for UUID strings
    required=True,
)

# Contact Information
databases.create_email_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='primary_contact_email',
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='business_email_domain',
    size=256,
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='phone_number',
    size=20,
    required=False,
)

# Billing Information
databases.create_email_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='billing_email',
    required=True,
)
"""

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='subscription_tier',
    size=20,
    required=False,
    default='free',  # Default to free tier
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='subscription_status',
    size=20,
    required=False,
    default='active',  # Default to active status
)

# Location Information
databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='address',
    size=512,
    required=False,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='city',
    size=100,
    required=False,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='country',
    size=2,  # ISO 2-letter country code
    required=False,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='timezone',
    size=50,
    required=False,
)

# Metadata
databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='industry',
    size=100,
    required=False,
)

databases.create_integer_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='company_size',
    required=False,
    min=1,
    max=1000000,
)

databases.create_boolean_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='is_active',
    required=False,
    default=True,
)

# Timestamps
databases.create_datetime_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='created_at',
    required=True,
)

databases.create_datetime_attribute(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='updated_at',
    required=True,
)

# Create indexes
databases.create_index(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='tenant_name_idx',
    type='fulltext',
    attributes=['tenant_name'],
)

databases.create_index(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='business_email_domain_idx',
    type='key',
    attributes=['business_email_domain'],
)

databases.create_index(
    database_id=DATABASE_ID,
    collection_id='tenants',
    key='subscription_status_idx',
    type='key',
    attributes=['subscription_status'],
)

# Note: tenant_id will be used as the document ID when creating documents
# instead of using ID.unique()
