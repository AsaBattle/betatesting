import os

def search_in_file(file_path, search_text):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            if search_text in file.read():
                return True
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return False

def search_directory(root_dir, search_text):
    matches = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            file_path = os.path.join(root, file)
            if search_in_file(file_path, search_text):
                matches.append(file_path)
    return matches

# Usage
root_directory = '.' # Start directory, '.' for current directory
search_text = 'replicate.run'
found_files = search_directory(root_directory, search_text)

for file in found_files:
    print(f"Found in {file}")

