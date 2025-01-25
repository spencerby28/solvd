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
    """
    # Create messages collection
    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='content',
        size=65535,  # Maximum size for long text
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='sender_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='sender_name',
        size=100,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='sender_type',
        size=20,  # customer/agent/system
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='source',
        size=30,  # web_widget/email/whatsapp/etc
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='attachments',
        size=255,
        required=False,
        array=True
    )
"""
    database.create_boolean_attribute(
        database_id='tickets',
        collection_id='messages',
        key='read_status',
        required=False,
        default=False
    )

    database.create_boolean_attribute(
        database_id='tickets',
        collection_id='messages',
        key='edited',
        required=False,
        default=False
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='ticket_id',
        size=36,
        required=True
    )

    database.create_string_attribute(
        database_id='tickets',
        collection_id='messages',
        key='tenant_id',
        size=36,
        required=True
    )

    print("Successfully created messages collection with attributes")

except Exception as e:
    print(f"Error seeding database: {str(e)}")
