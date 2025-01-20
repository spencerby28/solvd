from appwrite.client import Client
from appwrite.services.teams import Teams
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('PUBLIC_APPWRITE_ENDPOINT'))
client.set_project(os.getenv('PUBLIC_APPWRITE_PROJECT'))
client.set_key(os.getenv('APPWRITE_KEY'))

# Initialize Teams service
teams = Teams(client)

# Create a new team
try:
    team = teams.create(
        team_id='Admin',  # Unique team ID
        name='Admin',  # Team name
        roles=['admin']  # Default role for team creator
    )
    print(f"Team created successfully: {team}")
except Exception as e:
    print(f"Error creating team: {e}")
