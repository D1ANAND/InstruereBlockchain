import subprocess
import hashlib
import requests
import os
import uuid  
from dotenv import load_dotenv
import json

load_dotenv()
pinata_api_key = os.environ.get("PINATA_API_KEY")
pinata_secret_api_key = os.environ.get("PINATA_SECRET_API_KEY")

# ------------------ Step 1: Fetch train.py from IPFS ------------------ #
def fetch_train_script(ipfs_url):
    print("Fetching file from IPFS...")

    try:
        response = requests.get(ipfs_url)

        
        if response.status_code == 200:
            random_filename = f"train_{uuid.uuid4().hex}.py"

           
            with open(random_filename, 'wb') as file:
                file.write(response.content)
            
            print(f"Script fetched successfully and saved as {random_filename}")
            return random_filename  
        else:
            
            print(f"Failed to fetch file from IPFS. Status code: {response.status_code}, Message: {response.text}")
            raise Exception(f"Failed to fetch file from IPFS: {response.status_code}")
    except requests.exceptions.RequestException as e:
        
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

# ------------------ Step 3: Upload to IPFS------------------ #

def upload_to_IPFS(model_repo_id):
    print(f"Uploading started: {model_repo_id}")
    data = {
        'model_repo_id': model_repo_id
    }
    json_data = json.dumps(data)

    headers = {
        "pinata_api_key": pinata_api_key,
        "pinata_secret_api_key": pinata_secret_api_key
    }
    
    response = requests.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        json=data,
        headers=headers
    )

    # Check the response from Pinata
    if response.status_code == 200:
        ipfs_hash = response.json()["IpfsHash"]
        print(f"model_repo_id uploaded successfully. IPFS hash: {ipfs_hash}")
        return ipfs_hash
    else:
        print(f"Failed to upload model_repo_id. Status code: {response.status_code}")
        print(response.text)
        return None
    

def mine(ipfs_url):
    print("Starting mining process...")

    script_filename = fetch_train_script(ipfs_url)

    model_repo_id = train_model(script_filename)
    
    if model_repo_id:
        IPFS_hash = upload_to_IPFS(model_repo_id)
    else:
        print("Error: No valid model_repo_id found.")
    

    #DELETION
    # response = requests.delete(api_url)

    # if response.status_code == 200:
    #     print('Deleted item:', response.json())
    # elif response.status_code == 404:
    #     print('Error:', response.json()['error'])

    return IPFS_hash

if __name__ == '__main__':
  
    api_url = "http://localhost:3000/api/queue"  

    # Fetch CID from the API
    response = requests.get(api_url)

    if response.status_code == 200:
        data = response.json()
        cid = data.get('cid')  
        # print(f"CID: {cid}")

        
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{cid}"

        # Start the mining process
        mine(ipfs_url)
    else:
        print(f"Failed to fetch CID. Status code: {response.status_code}, Message: {response.text}")
