import re

def remove_links_from_file(file_path):
    with open(file_path, "r") as file:
        content = file.read()

    # Remove all markdown links and specific patterns
    content = re.sub(r'\[.*?\]\(.*?\)', '', content)
    content = re.sub(r'!\[.*?\]', '', content)
    content = re.sub(r'\]\(.*?\)', '', content)

    with open(file_path, "w") as file:
        file.write(content)

# Call the function to remove links from output.md
remove_links_from_file("output.md")
