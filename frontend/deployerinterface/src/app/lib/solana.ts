import * as anchor from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, Idl, AnchorProvider, setProvider } from "@coral-xyz/anchor";


export const SOLANA_CLUSTER_URL = "https://api.devnet.solana.com";

export async function getIdl(): Promise<any> {
  const response = await fetch("/my_custom_blockchain.json"); 
  if (!response.ok) {
    throw new Error(`Failed to fetch IDL: ${response.statusText}`);
  }
  const idl = await response.json(); 
  console.log("Fetched IDL:", JSON.stringify(idl as Idl, null, 2));
  console.log(idl.types);
  return idl;
}
export async function initializeBlockchain(
  provider: anchor.AnchorProvider
): Promise<string> {
  const idl = await getIdl();
  if (!idl) {
    throw new Error("Failed to fetch IDL");
  }

  const programId = new PublicKey(
    "5gnX8EpK8sdvvGpQjau6ZHahHwL9vXBPnerivRSiB3w3"
  );

  const program = new anchor.Program(idl, programId, provider);
  console.log(program);

  const blockchainAccount = anchor.web3.Keypair.generate();
  const { publicKey, signTransaction } = provider.wallet;

  if (!publicKey) {
    throw new Error("Wallet not connected");
  }

  await program.methods
    .initializeBlockchain()
    .accounts({
      blockchain: blockchainAccount.publicKey,
      user: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([blockchainAccount])
    .rpc();

  return blockchainAccount.publicKey.toString();
}

export async function addBlock(
  provider: anchor.AnchorProvider,
  blockchain: string,
  ipfsHash: string
): Promise<string> {
  const idl = await getIdl();
  const programId = new PublicKey(
    "5gnX8EpK8sdvvGpQjau6ZHahHwL9vXBPnerivRSiB3w3"
  );
  const program = new anchor.Program(idl, programId, provider);

  const { publicKey } = provider.wallet;

  await program.rpc.addBlock(ipfsHash, {
    accounts: {
      blockchain: new PublicKey(blockchain),
      miner: publicKey!,
    },
  });

  return "Block added!";
}

export async function rewardMiner(
  provider: anchor.AnchorProvider,
  amount: number,
  minerTokenAccount: string
): Promise<string> {
  const idl = await getIdl();
  const programId = new PublicKey(
    "5gnX8EpK8sdvvGpQjau6ZHahHwL9vXBPnerivRSiB3w3"
  );
  const program = new anchor.Program(idl, programId, provider);

  const mintAuthority = anchor.web3.Keypair.generate();
  console.log(mintAuthority);
  const { publicKey } = provider.wallet;
  console.log(publicKey);

  console.log("Received minerTokenAccount:", minerTokenAccount);

  try {
    bs58.decode(minerTokenAccount);
  } catch (e) {
    console.error("Invalid base58 string:", minerTokenAccount);
    throw new Error("Invalid base58 string for minerTokenAccount");
  }

  const minerTokenAccountPubkey = new PublicKey(minerTokenAccount);

  await program.rpc.rewardMiner(new anchor.BN(amount), {
    accounts: {
      mint: mintAuthority.publicKey,
      mintAuthority: mintAuthority.publicKey,
      minerTokenAccount: minerTokenAccountPubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    signers: [mintAuthority],
  });

  return "Miner rewarded!";
}

interface Block {
  blockNumber: number;
  miner: PublicKey;
  ipfsHash: string;
  timestamp: number;
}

interface BlockchainAccount {
  blocks: Block[];
}

export async function fetchBlockchainAccountData(
  provider: anchor.AnchorProvider,
  blockchainPublicKey: string
): Promise<Block[]> {
  const idl = await getIdl(); // Fetch the IDL
  const programId = new PublicKey(
    "5gnX8EpK8sdvvGpQjau6ZHahHwL9vXBPnerivRSiB3w3"
  );

  const program = new anchor.Program(idl, programId, provider);

  const blockchainAccount = (await program.account.blockchain.fetch(
    new PublicKey(blockchainPublicKey)
  )) as BlockchainAccount;

  console.log("Fetched Blockchain Account:", blockchainAccount);

  const blocks = blockchainAccount.blocks;

  blocks.forEach((block: Block, index: number) => {
    console.log(`Block ${index + 1}:`);
    console.log(`- Block Number: ${block.blockNumber}`);
    console.log(`- Miner: ${block.miner.toString()}`);
    console.log(`- IPFS Hash: ${block.ipfsHash}`);
    console.log(
      `- Timestamp: ${new Date(block.timestamp * 1000).toLocaleString()}`
    );
  });

  return blocks;
}
