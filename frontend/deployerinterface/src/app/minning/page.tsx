"use client";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import React, { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import {
  initializeBlockchain,
  addBlock,
  fetchBlockchainAccountData,
} from "../lib/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@project-serum/anchor";
import { SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Bubbles from "../components/Bubble";

const MiningButton: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blockchainKey, setBlockchainKey] = useState<string | null>(null);
  const [visibleBlocks, setVisibleBlocks] = useState<any[]>([]); // New state for showing blocks one by one
  const wallet = useWallet();
  const [mounted, setMounted] = useState(false);

  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new AnchorProvider(
    connection,
    useWallet() as any,
    AnchorProvider.defaultOptions()
  );

  useEffect(() => {
    setMounted(true);
    if (blockchainKey) {
      const fetchData = async () => {
        try {
          for (let i = 0; i < 3; i++) {
            const data = await fetchBlockchainAccountData(
              provider,
              blockchainKey
            );
            if (data) {
              setBlocks(data);
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error: any) {
          console.error("Error fetching blockchain data on mount:", error);
          setStatus("adding block....");
        }
      };

      fetchData();
    }
  }, [blockchainKey, provider]);

  useEffect(() => {
    // Show the blocks one by one with 5 seconds delay between each
    if (blocks.length > 0) {
      setVisibleBlocks([]); // Reset visible blocks each time new blocks are set
      let index = 0;
      const interval = setInterval(() => {
        if (index < blocks.length) {
          setVisibleBlocks((prevVisibleBlocks) => [
            blocks[index], // Prepend the new block
            ...prevVisibleBlocks, // Keep the previous blocks below the new one
          ]);
          index++;
        } else {
          clearInterval(interval); // Clear interval when all blocks are displayed
        }
      }, 5000); // 5 seconds delay
    }
  }, [blocks]); // Re-run when blocks are updated
  

  const startMining = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setStatus("Starting mining...");

    try {
      const response = await fetch("/api/mine");
      if (!response.ok) {
        const data = await response.json();
        setStatus(`Error: ${data.error}`);
        console.error("Mining failed:", data.error);
        return;
      }

      const data = await response.json();
      const ipfsHash = data?.ipfsHash?.IpfsHash;
      console.log("Mining output:", data);

      if (!ipfsHash) {
        setStatus("Error: IPFS hash not found.");
        return;
      }

      // setStatus(`Success! Model uploaded to IPFS: ${ipfsHash}`);

      let blockchainKeyToUse = blockchainKey;
      if (!blockchainKey) {
        blockchainKeyToUse = await initializeBlockchain(provider);
        blockchainKeyToUse = "Crs3dnYHwq49AtNjefvyT6aYyGSjaYojyAFtSMbY1DnZ";
        await addBlock(provider, blockchainKeyToUse!, ipfsHash);
        setStatus("Block added to blockchain!");
      } else {
        await addBlock(provider, blockchainKeyToUse!, ipfsHash);
      }

      const blockchainData = await fetchBlockchainAccountData(
        provider,
        blockchainKeyToUse!
      );
      setBlocks(blockchainData);
    } catch (error) {
      setStatus("Error: Unable to connect to mining server.");
      console.error("Failed to start mining:", error);
    }
  };

  return (
    <div className="abolute flex flex-col justify-center items-center h-screen space-y-8">
<div className="absolute top-4 flex justify-between right-64 space-x-6">
  <SignedOut>
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 border hover:from-blue-700 hover:to-teal-600 duration-500 rounded-md">
    <SignInButton />
    </div>
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 border rounded-md">
      <SignUpButton />
    </div>
  </SignedOut>


  {/* <SignedIn> */}
    {/* <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 border rounded-md"> */}
    <UserButton />
    {/* </div> */}
  {/* </SignedIn> */}
</div>

      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r">
        <h1 className="text-4xl font-bold mb-8 text-transparent text-white bg-clip-text bg-gradient-to-r">
          Mining
        </h1>
        <button
          onClick={startMining}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md shadow-lg transition duration-300 ease-in-out"
        >
          Start Mining
        </button>
        <p className="mt-4 text-lg  text-white">{status}</p>
        {visibleBlocks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Activity</h2>
            {visibleBlocks.map((block, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 mb-4  border-gray-300 rounded-md shadow text-white"
              >
                <div className="flex flex-col space-y-3">
                  <p>
                    <strong>Block Number:</strong>{" "}
                    {block?.blockNumber ? block.blockNumber.toString() : "N/A"}
                  </p>
                  <p>
                    <strong>Miner:</strong>
                    {block?.miner?.toBase58
                      ? block.miner.toBase58()
                      : typeof block?.miner === "object"
                      ? JSON.stringify(block.miner)
                      : "N/A"}
                  </p>
                </div>
                <div className="text-right pl-16">
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {block?.timestamp
                      ? new Date(
                          block.timestamp.toNumber() * 1000
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiningButton;
