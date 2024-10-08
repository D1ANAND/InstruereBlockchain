// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyCustomBlockchain is Ownable {
    // Block structure to store details
    struct Block {
        uint256 blockNumber;
        address miner;
        string ipfsHash;
        uint256 timestamp;
    }

    // Blockchain structure
    Block[] public blocks;
    
    // ERC20 token used for miner rewards
    IERC20 public rewardToken;
    
    // Event to log new blocks added
    event BlockAdded(uint256 blockNumber, address indexed miner, string ipfsHash, uint256 timestamp);
    
    // Constructor to set the ERC20 token address and initialize Ownable with msg.sender
constructor(address _rewardTokenAddress) Ownable(_rewardTokenAddress) {
    rewardToken = IERC20(_rewardTokenAddress);
}

    // Function to add a block to the blockchain
    function addBlock(string memory _ipfsHash) public {
        uint256 blockNumber = blocks.length + 1;
        blocks.push(Block({
            blockNumber: blockNumber,
            miner: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp
        }));
        
        emit BlockAdded(blockNumber, msg.sender, _ipfsHash, block.timestamp);
    }

    // Function to reward the miner with tokens
    function rewardMiner(address _miner, uint256 _amount) public onlyOwner {
        require(rewardToken.transfer(_miner, _amount), "Token transfer failed");
    }

    // Get block by index
    function getBlock(uint256 _index) public view returns (uint256, address, string memory, uint256) {
        Block memory _block = blocks[_index];
        return (_block.blockNumber, _block.miner, _block.ipfsHash, _block.timestamp);
    }

    // Get total number of blocks
    function getBlockCount() public view returns (uint256) {
        return blocks.length;
    }
}



