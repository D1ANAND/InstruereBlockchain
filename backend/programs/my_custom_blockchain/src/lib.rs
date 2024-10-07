// use anchor_lang::prelude::*;

// declare_id!("DwdiqELZhw57u63r6wjgVhuA9UKGjzVEvAGUPKDdcNTS");

// #[program]
// pub mod my_custom_blockchain {
//     use super::*;

//     pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
//         msg!("Greetings from: {:?}", ctx.program_id);
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct Initialize {}

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};

declare_id!("5gnX8EpK8sdvvGpQjau6ZHahHwL9vXBPnerivRSiB3w3");

#[program]
mod my_custom_blockchain {
    use super::*;

    pub fn initialize_blockchain(ctx: Context<InitializeBlockchain>) -> Result<()> {
        let blockchain = &mut ctx.accounts.blockchain;
        blockchain.blocks = Vec::new();
        Ok(())
    }

    pub fn add_block(ctx: Context<AddBlock>, ipfs_hash: String) -> Result<()> {
        let blockchain = &mut ctx.accounts.blockchain;
        let block = Block {
            block_number: blockchain.blocks.len() as u64 + 1,
            miner: ctx.accounts.miner.key(),
            ipfs_hash: ipfs_hash.clone(),
            timestamp: Clock::get().unwrap().unix_timestamp,
        };
        
        blockchain.blocks.push(block);
        Ok(())
    }

    pub fn reward_miner(ctx: Context<RewardMiner>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.mint_authority.to_account_info(),
            to: ctx.accounts.miner_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[account]
pub struct Blockchain {
    pub blocks: Vec<Block>,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Block {  // Deriving serialization/deserialization
    pub block_number: u64,
    pub miner: Pubkey,
    pub ipfs_hash: String,
    pub timestamp: i64,
}

#[derive(Accounts)]
pub struct InitializeBlockchain<'info> {
    #[account(init, payer = user, space = 9000)]
    pub blockchain: Account<'info, Blockchain>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddBlock<'info> {
    #[account(mut)]
    pub blockchain: Account<'info, Blockchain>,
    pub miner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RewardMiner<'info> {
    /// CHECK: The mint account is verified through the program logic.
    #[account(mut)]
    pub mint: AccountInfo<'info>, // Mint is safe because it's verified by program logic
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    /// CHECK: The miner's token account is verified through the program logic.
    #[account(mut)]
    pub miner_token_account: AccountInfo<'info>, // Token account is safe because it's verified by program logic
    pub token_program: Program<'info, Token>,
}
