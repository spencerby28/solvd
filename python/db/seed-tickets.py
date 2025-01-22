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
    # Create tickets database
    


    # Add attributes to tickets collection
    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='customer_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets', 
        collection_id='tickets',
        key='channel',
        size=20,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets', 
        key='category',
        size=50,
        required=True
    )

    database.create_datetime_attribute(
            database_id='tickets',
        collection_id='tickets',
        key='last_active',
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='messages',
        size=65535,
        required=False,
        array=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='customer_name',
        size=100,
        required=True
    )

    database.create_datetime_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='customer_last_seen',
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='customer_locale',
        size=10,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='customer_timezone',
        size=50,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='assigned_to',
        size=36,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='assigned_name',
        size=100,
        required=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='subject',
        size=255,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='tickets',
        key='internal_messages',
        size=65535,
        required=False,
        array=True
    )

    print("Successfully created tickets database and collection with attributes")

except Exception as e:
    print(f"Error seeding database: {str(e)}")

