import os
import json
import csv
import concurrent.futures
from openai import OpenAI
import pandas as pd
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client with API key from env
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

CATEGORIES = [
    {
        "name": "Sports Jerseys",
        "prompt": "Generate 10 realistic sports jersey products with varied teams, sizes and prices"
    },
    {
        "name": "Home Goods", 
        "prompt": "Generate 10 realistic home goods products like furniture, decor, and kitchen items"
    },
    {
        "name": "Books",
        "prompt": "Generate 10 realistic book products across different genres with titles, authors and prices"
    },
    {
        "name": "Kids Clothing",
        "prompt": "Generate 10 realistic children's clothing items with sizes and age ranges"
    },
    {
        "name": "Computer Hardware",
        "prompt": "Generate 10 realistic computer hardware products like GPUs, CPUs, RAM with detailed specs"
    }
]

def get_product_json(category: Dict) -> List[Dict]:
    """Make API call to GPT-4 to generate product data"""
    
    system_prompt = """You are a product catalog generator. Generate realistic product data in JSON format following this template for each product:
    {
        "Handle": "unique-product-handle",
        "Title": "Product Title",
        "Body": "Product description",
        "Vendor": "Brand name",
        "Product_Category": "Main category > Subcategory",
        "Type": "Product type",
        "Tags": "tag1, tag2",
        "Published": "TRUE",
        "Option1_Name": "Size/Type",
        "Option1_Value": "Value",
        "Variant_SKU": "SKU-123",
        "Variant_Grams": "1000",
        "Variant_Price": "99.99",
        "Status": "active"
    }"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": category["prompt"]}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        print(response.choices[0].message.content)
        
        products = json.loads(response.choices[0].message.content)
        return products

    except Exception as e:
        print(f"Error generating products for {category['name']}: {str(e)}")
        return []

def generate_all_products():
    """Generate products for all categories using thread pool"""
    products = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_category = {
            executor.submit(get_product_json, category): category 
            for category in CATEGORIES
        }
        
        for future in concurrent.futures.as_completed(future_to_category):
            category = future_to_category[future]
            try:
                result = future.result()
                if isinstance(result, dict) and "products" in result:
                    products.extend(result["products"])
                else:
                    print(f"Unexpected result format for {category['name']}")
            except Exception as e:
                print(f"Error processing {category['name']}: {str(e)}")

    print(products)
    
    return products

def save_to_csv(products: List[Dict], output_file: str = "generated_products.csv"):
    """Save products to CSV matching template format"""
    
    # Read template headers
    template_file = "template.csv"
    with open(template_file, 'r') as f:
        reader = csv.reader(f)
        headers = next(reader)
    
    # Create DataFrame with template headers
    df = pd.DataFrame(columns=headers)
    
    # Map product fields to template columns
    for product in products:
        row = {
            "Handle": product.get("Handle", ""),
            "Title": product.get("Title", ""), 
            "Body (HTML)": product.get("Body", ""),
            "Vendor": product.get("Vendor", ""),
            "Product Category": product.get("Product_Category", ""),
            "Type": product.get("Type", ""),
            "Tags": product.get("Tags", ""),
            "Published": product.get("Published", "TRUE"),
            "Option1 Name": product.get("Option1_Name", ""),
            "Option1 Value": product.get("Option1_Value", ""),
            "Variant SKU": product.get("Variant_SKU", ""),
            "Variant Grams": product.get("Variant_Grams", ""),
            "Variant Price": product.get("Variant_Price", ""),
            "Status": product.get("Status", "active")
        }
        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
            
    # Save to CSV
    df.to_csv(output_file, index=False)
    print(f"Generated products saved to {output_file}")

def main():
    products = generate_all_products()
    save_to_csv(products)

if __name__ == "__main__":
    main()
