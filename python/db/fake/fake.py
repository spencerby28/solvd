from faker import Faker
import random
from datetime import datetime, timedelta
import pytz
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.teams import Teams
from appwrite.id import ID

import os
from dotenv import load_dotenv
load_dotenv()

fake = Faker()

def generate_fake_data():
    # Initialize Appwrite client
    client = Client()
    
    # Set required API credentials
    if not os.getenv('PUBLIC_APPWRITE_ENDPOINT') or not os.getenv('PUBLIC_APPWRITE_PROJECT') or not os.getenv('APPWRITE_KEY'):
        raise ValueError("Missing required environment variables. Please set PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT and APPWRITE_KEY")
        
    try:
        client.set_endpoint(os.getenv('PUBLIC_APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('PUBLIC_APPWRITE_PROJECT'))
        client.set_key(os.getenv('APPWRITE_KEY'))
    except Exception as e:
        print(f"Error initializing Appwrite client: {str(e)}")
        return
        
    database = Databases(client)
    teams = Teams(client)
    
    # Get user input
    tenant_name = input("Enter tenant name: ")
    num_customers = int(input("Enter number of customers to generate: "))
    num_tickets = int(input("Enter number of tickets to generate: "))
    num_messages_per_ticket = int(input("Enter average number of messages per ticket: "))

    # Track IDs
    created_ids = {
        "tenant_ids": [],
        "customer_ids": [],
        "ticket_ids": [], 
        "message_ids": []
    }

    try:
        # Create team with proper roles
        team_id = tenant_name.lower().replace(" ", "_")  # Use tenant name as team ID
        team = teams.create(
            team_id=team_id,
            name=tenant_name[:128],  # Ensure name within max length
            roles=['owner', 'admin', 'member']  # Default roles for the team
        )
        
        # Generate and create tenant data
        tenant_id = tenant_name.lower().replace(" ", "_")  # Use tenant name as tenant ID
        tenant = {
            "tenant_name": tenant_name,
            "user_ids": [ID.unique() for _ in range(3)],
            "primary_contact_email": fake.company_email(),
            "business_email_domain": fake.domain_name(),
            "billing_email": fake.company_email(),
            "created_at": fake.date_time_this_year().isoformat(),
            "updated_at": fake.date_time_this_month().isoformat(),
            "avatar_url": fake.image_url(),
            "phone_number": fake.phone_number()[:20], # Ensure phone number is within 20 char limit
            "subscription_tier": random.choice(["FREE", "PRO", "ENTERPRISE"]),
            "subscription_status": "ACTIVE",
            "address": fake.street_address(),
            "city": fake.city(),
            "country": fake.country_code(),
            "timezone": random.choice(pytz.all_timezones),
            "industry": fake.job(),
            "company_size": random.randint(10, 1000),
            "is_active": True
        }
        
        tenant_doc = database.create_document(
            database_id='tenants',
            collection_id='tenants', 
            document_id=tenant_id,
            data=tenant,
            permissions=[
                "read(\"team:" + team_id + "\")",
                "update(\"team:" + team_id + "\")", 
                "write(\"team:" + team_id + ":admin\")"
            ]
        )
        created_ids["tenant_ids"].append(tenant_id)
        # Generate and create customers
        customers = []
        for _ in range(num_customers):
            customer_id = tenant_id + "_customer_" + str(len(customers) + 1)
            customer = {
                "name": fake.name(),
                "locale": fake.locale().replace('_', '-'),
                "timezone": random.choice(pytz.all_timezones),
                "status": random.choice(["ACTIVE", "INACTIVE"]),
                "tenant_id": tenant_id,
                "email": fake.email(),
                "instagram_id": customer_id,
                "instagram_username": fake.user_name(),
                "shopify_id": tenant_id + "_shopify_" + str(len(customers) + 1),
                "tickets": []
            }
            
            customer_doc = database.create_document(
                database_id='tickets',
                collection_id='customers',
                document_id=customer_id,
                data=customer,
                permissions=[
                    "read(\"team:" + team_id + "\")",
                    "update(\"team:" + team_id + "\")", 
                    "write(\"team:" + team_id + ":admin\")"
                ]
            )
            customers.append(customer)
            created_ids["customer_ids"].append(customer_id)

        # Generate tickets and messages
        tickets = []
        messages = []
        
        channels = ["email", "chat", "instagram", "whatsapp"]
        categories = ["support", "sales", "billing", "technical"]
        statuses = ["NEW", "OPEN", "WORKING", "ESCALATED", "SOLVD"]
        priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]

        for _ in range(num_tickets):
            customer = random.choice(customers)
            channel = random.choice(channels)
            ticket_id = tenant_id + "_ticket_" + str(len(tickets) + 1)
            
            ticket = {
                "customer_id": customer["instagram_id"],
                "channel": channel,
                "category": random.choice(categories),
                "last_active": fake.date_time_this_month().isoformat(),
                "customer_name": customer["name"],
                "customer_last_seen": fake.date_time_this_month().isoformat(),
                "customer_locale": customer["locale"],
                "customer_timezone": customer["timezone"],
                "assigned_to": random.choice(tenant["user_ids"]),
                "assigned_name": fake.name(),
                "subject": fake.sentence(),
                "tenant_id": tenant_id,
                "priority": random.choice(priorities),
                "status": random.choice(statuses),
                "customer_email": customer["email"],
                "pinned": random.choice([True, False]),
                "replied": random.choice([True, False]),
                "converted": random.choice([True, False])
            }
            
            ticket_doc = database.create_document(
                database_id='tickets',
                collection_id='tickets',
                document_id=ticket_id,
                data=ticket,
                permissions=[
                    "read(\"team:" + team_id + "\")",
                    "update(\"team:" + team_id + "\")", 
                    "write(\"team:" + team_id + ":admin\")"
                ]
            )
            tickets.append(ticket)
            created_ids["ticket_ids"].append(ticket_id)
            
            # Generate messages for this ticket
            num_messages = random.randint(1, num_messages_per_ticket * 2)
            ticket_messages = []
            for _ in range(num_messages):
                message_id = tenant_id + "_message_" + str(len(messages) + 1)
                sender_type = random.choice(["customer", "agent"])
                message = {
                    "content": fake.paragraph(),
                    "sender_id": random.choice([customer["instagram_id"]] + tenant["user_ids"]),
                    "sender_name": customer["name"] if sender_type == "customer" else ticket["assigned_name"],
                    "sender_type": sender_type,
                    "channel": channel,
                    "ticket_id": ticket_id,
                    "tenant_id": tenant_id,
                    "attachments": [fake.file_name() for _ in range(random.randint(0, 2))],
                    "read_status": random.choice([True, False]),
                    "edited": random.choice([True, False]),
                    "email": customer["email"],
                    "subject": ticket["subject"],
                    "is_welcome": False
                }
                
                message_doc = database.create_document(
                    database_id='tickets',
                    collection_id='messages',
                    document_id=message_id,
                    data=message,
                    permissions=[
                        "read(\"team:" + team_id + "\")",
                        "update(\"team:" + team_id + "\")", 
                        "write(\"team:" + team_id + ":admin\")"
                    ]
                )
                messages.append(message)
                ticket_messages.append(message)
                created_ids["message_ids"].append(message_id)
                
            # Update ticket with messages
            database.update_document(
                database_id='tickets',
                collection_id='tickets',
                document_id=ticket_id,
                data={
                    "messages": [msg["content"] for msg in ticket_messages],
                    "last_message": ticket_messages[-1]["content"][:97] + "..." if ticket_messages else ""
                }
            )

        # Save created IDs to file
        with open(f'{tenant_name}_created_ids.json', 'w') as f:
            json.dump(created_ids, f, indent=2)

        return {
            "tenant": tenant,
            "customers": customers,
            "tickets": tickets,
            "messages": messages
        }

    except Exception as e:
        print(f"Error generating fake data: {str(e)}")
        return None

if __name__ == "__main__":
    data = generate_fake_data()
    if data:
        print(f"Generated:")
        print(f"1 Tenant: {data['tenant']['tenant_name']}")
        print(f"{len(data['customers'])} Customers")
        print(f"{len(data['tickets'])} Tickets")
        print(f"{len(data['messages'])} Messages")
        print(f"\nCreated IDs saved to {data['tenant']['tenant_name']}_created_ids.json")
    else:
        print("Failed to generate fake data")
        print("Failed to generate fake data")
