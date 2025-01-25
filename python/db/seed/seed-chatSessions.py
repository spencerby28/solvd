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
        collection_id='chat_sessions',
        key='session_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions', 
        key='tenant_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='customer_id',
        size=36,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='ticket_id',
        size=36,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='status',
        size=20,
        required=True
    )

    database.create_datetime_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='last_activity',
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='current_category',
        size=50,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='browser',
        size=100,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='platform',
        size=50,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='chat_sessions',
        key='ip_address',
        size=45,
        required=False
    )

    print("Successfully created chat_sessions collection with attributes")

except Exception as e:
    print(f"Error seeding database: {str(e)}")
