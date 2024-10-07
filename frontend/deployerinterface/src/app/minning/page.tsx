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


const MiningButton: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blockchainKey, setBlockchainKey] = useState<string | null>(null);
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
          for (let i = 0; i < 5; i++) {
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

      setStatus(`Success! Model uploaded to IPFS: ${ipfsHash}`);

      let blockchainKeyToUse = blockchainKey;
      if (!blockchainKey) {
        blockchainKeyToUse = await initializeBlockchain(provider);
        setBlockchainKey(blockchainKeyToUse);
        console.log("Blockchain initialized:", blockchainKeyToUse);

        setTimeout(async () => {
          await addBlock(provider, blockchainKeyToUse!, ipfsHash);
          setStatus("Block added to blockchain!");
          console.log("Block added with IPFS Hash:", ipfsHash);
        }, 10000);
      } else {
        await addBlock(provider, blockchainKeyToUse!, ipfsHash);
        setStatus("Block added to blockchain!");
        console.log("Block added with IPFS Hash:", ipfsHash);
      }

      const blockchainData = await fetchBlockchainAccountData(
        provider,
        blockchainKeyToUse!
      );
      console.log("Fetched Blockchain Data", blockchainData);
      setBlocks(blockchainData);
    } catch (error) {
      setStatus("Error: Unable to connect to mining server.");
      console.error("Failed to start mining:", error);
    }
  };

  return (
    <div>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r">
          <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r">
            Mining Extension
          </h1>
          <button
            onClick={startMining}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md shadow-lg transition duration-300 ease-in-out"
          >
            Start Mining
          </button>
          <p className="mt-4 text-lg text-gray-800">{status}</p>
          {blocks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Blockchain Data</h2>
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className="p-4 mb-4 border border-gray-300 rounded-md shadow"
                >
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

                  <p>
                    <strong>IPFS Hash:</strong> {block?.ipfsHash || "N/A"}
                  </p>

                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {block?.timestamp
                      ? new Date(
                          block.timestamp.toNumber() * 1000
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default MiningButton;
