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
database = Databases(client)

# Seed the database
try:
    # Create basic attributes
    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='name',
        size=100,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='email',
        size=255,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='locale',
        size=10,
        required=True,

    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='timezone',
        size=50,
        required=True,
    )

    # Platform IDs
    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='instagram_id',
        size=50,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='instagram_username',
        size=30,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='shopify_id',
        size=50,
        required=False
    )

    # Relationships and status
    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='tickets',
        size=36,
        required=False,
        array=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='status',
        size=20,
        required=True,
        
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='customers',
        key='tenant_id',
        size=36,
        required=True
    )

    print("Successfully created customers collection with attributes")

except Exception as e:
    print(f"Error seeding database: {str(e)}")
