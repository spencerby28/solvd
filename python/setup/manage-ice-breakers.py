import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def setup_ice_breakers():
    access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
    instagram_id = os.getenv('INSTAGRAM_ID')

    message_body = {
        "ice_breakers": [
            {
                "question": "I have a question about a product",
                "payload": "PRODUCT_QUESTION"
            },
            {
                "question": "Track my order",
                "payload": "TRACK_ORDER" 
                # order Status
            },
            {
                "question": "There's a problem with my order",
                "payload": "ORDER_PROBLEM"
            },
            {
                "question": "I have a question about ACME Inc.",
                "payload": "COMPANY_QUESTION"
            }
        ]
    }

    response = requests.post(
        f"https://graph.instagram.com/v21.0/{instagram_id}/messenger_profile",
        headers={
            "Content-Type": "application/json"
        },
        params={
            "access_token": access_token
        },
        json=message_body
    )

    if response.status_code != 200:
        print(f"Failed to set ice breakers: {response.text}")
        return False

    print("Successfully set ice breakers")
    return True

def delete_ice_breakers():
    access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
    instagram_id = os.getenv('INSTAGRAM_ID')

    message_body = {
        "fields": ["ice_breakers"]
    }

    response = requests.delete(
        f"https://graph.instagram.com/v21.0/{instagram_id}/messenger_profile",
        headers={
            "Content-Type": "application/json"
        },
        params={
            "access_token": access_token
        },
        json=message_body
    )

    if response.status_code != 200:
        print(f"Failed to delete ice breakers: {response.text}")
        return False

    print("Successfully deleted ice breakers")
    return True

def get_ice_breakers():
    access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
    instagram_id = os.getenv('INSTAGRAM_ID')

    response = requests.get(
        f"https://graph.instagram.com/v21.0/{instagram_id}/messenger_profile",
        params={
            "fields": "ice_breakers",
            "access_token": access_token
        }
    )

    if response.status_code != 200:
        print(f"Failed to get ice breakers: {response.text}")
        return None

    print("Successfully retrieved ice breakers")
    return response.json()

def main():
    print("\nInstagram Ice Breakers Manager")
    print("1. Set up ice breakers")
    print("2. Delete ice breakers")
    print("3. Get ice breakers")
    print("4. Exit")

    while True:
        choice = input("\nEnter your choice (1-4): ")
        
        if choice == "1":
            setup_ice_breakers()
        elif choice == "2":
            delete_ice_breakers()
        elif choice == "3":
            ice_breakers = get_ice_breakers()
            if ice_breakers:
                print(ice_breakers)
        elif choice == "4":
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 