import subprocess
import hashlib
import requests
import os
import uuid  
from dotenv import load_dotenv

load_dotenv()

# ------------------ Step 1: Fetch train.py from IPFS ------------------ #
def fetch_train_script(ipfs_url):
    print("Fetching file from IPFS...")

    try:
        response = requests.get(ipfs_url)

        # Check if the response status is OK (200)
        if response.status_code == 200:
            random_filename = f"train_{uuid.uuid4().hex}.py"

            # Save the content of the response as a .py file
            with open(random_filename, 'wb') as file:
                file.write(response.content)
            
            print(f"Script fetched successfully and saved as {random_filename}")
            return random_filename  
        else:
            # Log the error with details about the failure
            print(f"Failed to fetch file from IPFS. Status code: {response.status_code}, Message: {response.text}")
            raise Exception(f"Failed to fetch file from IPFS: {response.status_code}")
    except requests.exceptions.RequestException as e:
        # Catch any errors related to the request itself
        print(f"Error fetching file from IPFS: {e}")
        raise

# ------------------ Step 2: Train Model Locally ------------------ #
def train_model(script_filename):
    print(f"Training model using {script_filename}...")

    result = subprocess.run(["python", script_filename], capture_output=True, text=True)
    print("Model training completed!")
    print("Captured stdout:", result.stdout)
    print("Captured stderr:", result.stderr)

    output_lines = result.stdout.splitlines()
    for line in output_lines:
        if line.strip():  
            return line.strip() 

# ------------------ Step 3: Generate Proof of Work ------------------ #
def generate_proof(model_repo_id):
    print(f"Generating proof of work with model_repo_id: {model_repo_id}")
   
    pow_hash = hashlib.sha256(model_repo_id.encode()).hexdigest()
    print(f"Proof of Work generated: {pow_hash}")
    return pow_hash

def mine(ipfs_url):
    print("Starting mining process...")

    script_filename = fetch_train_script(ipfs_url)

    model_repo_id = train_model(script_filename)
    
    if model_repo_id:
        pow_hash = generate_proof(model_repo_id)
    else:
        print("Error: No valid model_repo_id found.")
    

    #DELETION
    response = requests.delete(api_url)

    if response.status_code == 200:
        print('Deleted item:', response.json())
    elif response.status_code == 404:
        print('Error:', response.json()['error'])

    return pow_hash

if __name__ == '__main__':
  
    api_url = "http://localhost:3000/api/queue"  

    # Fetch CID from the API
    response = requests.get(api_url)

    if response.status_code == 200:
        data = response.json()
        cid = data.get('cid')  # Extract the CID from the response
        # print(f"CID: {cid}")

        # Construct the IPFS URL using the CID
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{cid}"

        # Start the mining process
        mine(ipfs_url)
    else:
        print(f"Failed to fetch CID. Status code: {response.status_code}, Message: {response.text}")
