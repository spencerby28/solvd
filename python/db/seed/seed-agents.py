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

"""
# Core Identity Attributes
databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='name',
    size=256,
    required=True,
)

databases.create_email_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='email',
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='tenant_id',
    size=36,
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='department',
    size=20,
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='role',
    size=20,
    required=True,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='status',
    size=20,
    required=True,
    
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='expertise',
    array=True,
    size=50,
    required=False,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='timezone',
    size=50,
    required=False,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='avatar_url',
    size=1024,
    required=False,
)

databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='phone_number',
    size=20,
    required=False,
)
"""
databases.create_string_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='languages',
    array=True,
    size=2,  # ISO 639-1 language codes
    required=False,
)

databases.create_boolean_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='is_active',
    required=False,
    default=True,
)

# Timestamps
databases.create_datetime_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='last_active',
    required=True,
)

databases.create_datetime_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='created_at',
    required=True,
)

databases.create_datetime_attribute(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='updated_at',
    required=True,
)

# Create indexes
databases.create_index(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='email_idx',
    type='unique',
    attributes=['email'],
)

databases.create_index(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='tenant_id_idx',
    type='key',
    attributes=['tenant_id'],
)

databases.create_index(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='status_idx',
    type='key',
    attributes=['status'],
)

databases.create_index(
    database_id=DATABASE_ID,
    collection_id='agents',
    key='name_idx',
    type='fulltext',
    attributes=['name'],
)
