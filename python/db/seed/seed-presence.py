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
    database.create_string_attribute(
        database_id='tickets',
        collection_id='presence',
        key='session_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='presence',
        key='tenant_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='presence',
        key='customer_id',
        size=36,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='presence',
        key='status',
        size=20,
        required=True
    )

    database.create_datetime_attribute(
        database_id='tickets',
        collection_id='presence',
        key='last_ping',
        required=True
    )

    print("Successfully created presence collection with attributes")

except Exception as e:
    print(f"Error seeding database: {str(e)}")