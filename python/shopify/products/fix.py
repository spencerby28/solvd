import pandas as pd

# Read the CSV file
df = pd.read_csv('generated_products.csv')

# Set default values for all rows
df['Variant Inventory Policy'] = df['Variant Inventory Policy'].fillna('deny')
df['Variant Fulfillment Service'] = df['Variant Fulfillment Service'].fillna('manual')

# Save back to CSV
df.to_csv('generated_products.csv', index=False)
print("Updated inventory policy and fulfillment service for all products")
