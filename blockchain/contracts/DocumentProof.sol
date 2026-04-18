// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DocumentProof
 * @dev Decentralized Proof of Existence for digital assets
 */
contract DocumentProof {
    
    struct Proof {
        address owner;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from file hash (bytes32) to Proof details
    mapping(bytes32 => Proof) public proofs;

    event ProofStored(bytes32 indexed fileHash, address indexed owner, uint256 timestamp);

    /**
     * @dev Generates event and stores proof of document via it's SHA-256 hash
     * @param _fileHash The SHA-256 hash of the document
     */
    function storeProof(bytes32 _fileHash) public {
        require(!proofs[_fileHash].exists, "Document API: Proof already exists for this hash.");
        
        proofs[_fileHash] = Proof({
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit ProofStored(_fileHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Checks if a specific file hash has been stored in this contract
     * @param _fileHash The SHA-256 hash to check
     * @return owner Address of the owner
     * @return timestamp When the hash was registered
     * @return exists If the document hash indeed exists on-chain
     */
    function verifyProof(bytes32 _fileHash) public view returns (address owner, uint256 timestamp, bool exists) {
        Proof memory p = proofs[_fileHash];
        return (p.owner, p.timestamp, p.exists);
    }
}
