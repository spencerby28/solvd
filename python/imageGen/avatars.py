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
Path("images/avatars").mkdir(parents=True, exist_ok=True)

# Professional LinkedIn header prompts following Type, Subject, Setting, Mood/Color, Style, Emphasis format
linkedin_prompts = [
    # Round 1
    [
        "Professional photograph of a young Caucasian female professional, wearing a modern cream blazer, in a bright contemporary office space, with soft natural lighting revealing fresh skin texture, subtle smile lines, and youthful facial features, captured in a premium editorial style, emphasis on confidence, warmth and authenticity",
        "Professional headshot of a young white female entrepreneur, wearing a light grey tailored suit, in a minimalist office setting, with bright diffused lighting highlighting clear skin tone, gentle facial contours and natural expression, shot in contemporary portrait style, emphasis on ambition, approachability and genuine presence", 
        "Professional portrait of a young Caucasian businesswoman, in a blush pink blazer, against a clean white backdrop, with airy lighting that captures smooth skin texture, fresh-faced features and natural vitality, captured in high-end commercial style, emphasis on innovation, confidence and authenticity",
        "Professional photograph of a young white female consultant, in refined business casual attire, within a modern startup environment, with soft window lighting accentuating clear complexion, natural features and subtle smile, shot in premium corporate style, emphasis on expertise, friendliness and genuine presence",
        "Professional headshot of a young Caucasian female tech leader, in smart contemporary wear, against a sleek office background, with bright modern lighting that reveals fresh skin texture, youthful contours and natural expression, captured in polished LinkedIn style, emphasis on forward-thinking, capability and authenticity"
    ],
    # Round 2
    [
        "Professional portrait of a young white male executive, in chic business attire, within a light-filled office space, with flattering natural lighting emphasizing clear skin texture, subtle features and fresh-faced glow, shot in editorial style, emphasis on leadership, poise and authentic presence",
        "Professional photograph of a young Caucasian male creative director, in sophisticated casual wear, in a design-forward environment, with artistic lighting that captures smooth skin tone, natural features and engaging expression, captured in creative industry style, emphasis on creativity, professionalism and authenticity",
        "Professional headshot of a young white male business owner, in polished modern attire, against a contemporary neutral backdrop, with soft rim lighting revealing fresh complexion, gentle facial contours and natural warmth, shot in premium personal brand style, emphasis on approachability, confidence and genuine presence",
        "Professional portrait of a young Caucasian male strategist, in a tailored blazer, within a bright professional setting, with structured lighting highlighting clear skin details, youthful features and natural expression, captured in corporate editorial style, emphasis on strategic thinking, competence and authenticity",
        "Professional photograph of a young white male entrepreneur, in refined business wear, against an elegant office backdrop, with diffused lighting that shows fresh skin texture, natural contours and subtle vitality, shot in modern professional style, emphasis on innovation, capability and genuine presence"
    ]
]

def generate_avatar(prompt):
    """
    Generate an avatar with a specific prompt
    """
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="hd",
            n=1,
        )
        
        # Get the image URL
        image_url = response.data[0].url
        
        # Download and save image
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            filename = f'images/avatars/profile_{datetime.now().strftime("%Y%m%d%H%M%S")}.png'
            with open(filename, 'wb') as f:
                f.write(img_response.content)
            return filename
                
        print(f"Successfully generated and saved avatar")
        
    except Exception as e:
        print(f"Error generating avatar: {str(e)}")
        return None

# Generate two rounds of avatars
for round_num, prompts in enumerate(linkedin_prompts, 1):
    print(f"\nGenerating Round {round_num} avatars...")
    for i, prompt in enumerate(prompts, 1):
        print(f"Generating avatar {i} of 5 for Round {round_num}")
        avatar_path = generate_avatar(prompt)
        if avatar_path:
            print(f"Successfully generated avatar: {avatar_path}")
