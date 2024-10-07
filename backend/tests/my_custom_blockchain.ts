// import * as anchor from '@project-serum/anchor';
// import { PublicKey, SystemProgram } from '@solana/web3.js';
// import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
// // import { Wallet } from '@solana/wallet-adapter-react';
// // import my_custom_blockchain from "../../../../target/idl/my_custom_blockchain.json"


// export const SOLANA_CLUSTER_URL = 'https://api.devnet.solana.com';

// async function getIdl(): Promise<any> {
//     const response = await fetch('/my_custom_blockchain.json'); // Path to your IDL file
//     if (!response.ok) {
//         throw new Error(`Failed to fetch IDL: ${response.statusText}`);
//     }
//     const idl = await response.json(); // Parse JSON into a JS object
//     console.log("Fetched IDL:", JSON.stringify(idl, null, 2)); // Log the IDL for debugging
//     return idl;
// }

// // Initialize Blockchain
// export async function initializeBlockchain(provider: anchor.AnchorProvider): Promise<string> {
//     const idl = await getIdl();
//     if (!idl) {
//         throw new Error("Failed to fetch IDL");
//     }

//     const programId = new PublicKey("DwdiqELZhw57u63r6wjgVhuA9UKGjzVEvAGUPKDdcNTS");
//     const program = new anchor.Program(idl, programId, provider);

//     const blockchainAccount = anchor.web3.Keypair.generate();
//     const user = provider.wallet.publicKey;
//     if (!user) {
//         throw new Error("Wallet not connected");
//     }

//     await program.methods
//         .initializeBlockchain()
//         .accounts({
//             blockchain: blockchainAccount.publicKey,
//             user: user,
//             systemProgram: SystemProgram.programId,
//         })
//         .signers([blockchainAccount])
//         .rpc();

//     return blockchainAccount.publicKey.toString();
// }

// // Add Block
// export async function addBlock(
//     provider: anchor.AnchorProvider,
//     blockchain: string,
//     ipfsHash: string
// ): Promise<string> {
//     const idl = await getIdl(); // Load IDL using fetch
//     const programId = new PublicKey('DwdiqELZhw57u63r6wjgVhuA9UKGjzVEvAGUPKDdcNTS');
//     const program = new anchor.Program(idl, programId, provider);

//     const user = provider.wallet.publicKey;

//     await program.rpc.addBlock(ipfsHash, {
//         accounts: {
//             blockchain: new PublicKey(blockchain),
//             miner: user!,
//         },
//     });

//     return 'Block added!';
// }

// // Reward Miner
// export async function rewardMiner(
//     provider: anchor.AnchorProvider,
//     amount: number,
//     minerTokenAccount: string
// ): Promise<string> {
//     const idl = await getIdl(); // Load IDL using fetch
//     const programId = new PublicKey('DwdiqELZhw57u63r6wjgVhuA9UKGjzVEvAGUPKDdcNTS');
//     const program = new anchor.Program(idl, programId, provider);

//     const mintAuthority = anchor.web3.Keypair.generate();

//     await program.rpc.rewardMiner(new anchor.BN(amount), {
//         accounts: {
//             mint: mintAuthority.publicKey,
//             mintAuthority: mintAuthority.publicKey,
//             minerTokenAccount: new PublicKey(minerTokenAccount),
//             tokenProgram: TOKEN_PROGRAM_ID,
//         },
//         signers: [mintAuthority],
//     });

//     return 'Miner rewarded!';
// }
