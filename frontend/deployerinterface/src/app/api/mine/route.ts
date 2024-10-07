import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import fetch from 'node-fetch'; // Use node-fetch for server-side fetch
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper functions

// Fetch train.py from IPFS
async function fetchTrainScript(ipfsUrl: string): Promise<string> {
  console.log("Fetching file from IPFS...");

  const response = await fetch(ipfsUrl);

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const randomFilename = `train_${uuidv4()}.py`;

    // Save the file locally
    fs.writeFileSync(randomFilename, Buffer.from(buffer));
    console.log(`Script fetched successfully and saved as ${randomFilename}`);
    return randomFilename;
  } else {
    throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
  }
}

// Train the model locally
async function trainModel(scriptFilename: string): Promise<string> {
  console.log(`Training model using ${scriptFilename}...`);

  try {
    const { stdout } = await execAsync(`python ${scriptFilename}`);

    // Log full stdout for debugging
    console.log("Full stdout:", stdout);
    console.log("Model training completed!");

    // Capture the last line of stdout as modelRepoId
    const outputLines = stdout.trim().split('\n');
    const modelRepoId = outputLines[outputLines.length - 1].trim();
    console.log("Captured modelRepoId:", modelRepoId);

    return modelRepoId;
  } catch (error) {
    console.error(`Error training model: ${error}`);
    throw new Error(`Model training failed: ${error}`);
  }
}

// Upload the modelRepoId to IPFS
async function uploadToIPFS(modelRepoId: string): Promise<string | null> {
  console.log(`Uploading model repo ID: ${modelRepoId} to IPFS...`);

  const data = {
    model_repo_id: modelRepoId,
  };

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY || '',
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const IpfsHash: any = await response.json();
      console.log(`model_repo_id uploaded successfully. IPFS hash: ${IpfsHash}`);
      return IpfsHash;
    } else {
      console.error(`Failed to upload model_repo_id. Status code: ${response.status}`);
      return null;
    }
  } catch (error: any) {
    console.error(`Error uploading to IPFS: ${error.message}`);
    return null;
  }
}

// Main mining process
async function mine(ipfsUrl: string) {
  try {
    const scriptFilename = await fetchTrainScript(ipfsUrl);
    const modelRepoId = await trainModel(scriptFilename);

    if (modelRepoId) {
      const ipfsHash = await uploadToIPFS(modelRepoId);
      return { success: true, ipfsHash };
    } else {
      throw new Error("Error: No valid model_repo_id found.");
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Named export for GET request
export async function GET(req: NextRequest) {
  try {
    // Call your /api/queue route to get the CID
    const response = await fetch("http://localhost:3000/api/queue");
    const data: any = await response.json();

    const cid = data.cid;

    if (!cid) {
      return NextResponse.json({ error: 'CID is required' }, { status: 400 });
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const result = await mine(ipfsUrl);

    if (result.success) {
      return NextResponse.json({ success: true, ipfsHash: result.ipfsHash });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
