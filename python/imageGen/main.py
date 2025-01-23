from openai import OpenAI
import os
from dotenv import load_dotenv
from pathlib import Path
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

# Create images directory if it doesn't exist
Path("images").mkdir(exist_ok=True)

# List of prompts for different customer service themed images
logo_prompts = [
    "A minimalist icon showing two chat bubbles in solid hex #16a34a on white, representing customer conversation and support.",
    "A simple geometric icon of a headset in solid hex #16a34a on white, symbolizing customer service and assistance.",
    "A clean icon of a handshake in solid hex #16a34a on white, representing customer satisfaction and partnership.",
    "A minimalist icon showing a lightbulb in solid hex #16a34a on white, symbolizing problem-solving and solutions.",
    "A geometric icon of interconnected nodes in solid hex #16a34a on white, representing seamless customer support systems.",
    "A simple icon of a shield in solid hex #16a34a on white, symbolizing customer trust and protection.",
    "A clean icon showing a checkmark in a circle in solid hex #16a34a on white, representing resolved customer issues."
]

def generate_and_save_logo(prompt, index):
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt + " The logo must be centered and isolated on the background.",
            size="1024x1024",
            quality="hd",
            n=1,
        )
        
        # Get the image URL
        image_url = response.data[0].url
        # Download and save image
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            filename = f'images/solvd_logo_{index+1}_{datetime.now().strftime("%Y%m%d%H%M%S")}.png'
            with open(filename, 'wb') as f:
                f.write(img_response.content)
                
        print(f"Successfully generated and saved logo variant {index + 1}")
        
    except Exception as e:
        print(f"Error generating logo variant {index + 1}: {str(e)}")

def generate_variations(image_path):
    try:
        with open(image_path, "rb") as image_file:
            response = client.images.create_variation(
                image=image_file,
                n=4,
                size="1024x1024"
            )
            
            # Save each variation
            for i, image in enumerate(response.data):
                img_response = requests.get(image.url)
                if img_response.status_code == 200:
                    filename = f'images/variation_{i+1}_{datetime.now().strftime("%Y%m%d%H%M%S")}.png'
                    with open(filename, 'wb') as f:
                        f.write(img_response.content)
                        
            print(f"Successfully generated and saved variations")
            
    except Exception as e:
        print(f"Error generating variations: {str(e)}")

# Generate all logo variants in parallel using 5 cores
from concurrent.futures import ThreadPoolExecutor

#with ThreadPoolExecutor(max_workers=5) as executor:
 #   executor.map(lambda x: generate_and_save_logo(x[1], x[0]), enumerate(logo_prompts))
    
# Generate variations from existing image
with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(lambda x: generate_variations(x), ["images/alsoBoom.png"] * 5)
