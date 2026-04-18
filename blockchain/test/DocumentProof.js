const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentProof", function () {
  let DocumentProof, documentProof, owner, addr1;

  beforeEach(async function () {
    DocumentProof = await ethers.getContractFactory("DocumentProof");
    [owner, addr1] = await ethers.getSigners();
    documentProof = await DocumentProof.deploy();
  });

  describe("Proof Storage and Verification", function () {
    it("Should store a proof and emit an event", async function () {
      const hash = ethers.id("test-document"); // generates bytes32 hash
      
      await expect(documentProof.connect(addr1).storeProof(hash))
        .to.emit(documentProof, "ProofStored")
        // We can't easily check timestamp in event with waffle unless we allow any, but let's check owner
        .withArgs(hash, addr1.address, (val) => val > 0);
        
      const proof = await documentProof.verifyProof(hash);
      expect(proof.owner).to.equal(addr1.address);
      expect(proof.exists).to.equal(true);
      expect(proof.timestamp).to.be.gt(0);
    });

    it("Should revert if proof already exists", async function () {
      const hash = ethers.id("unique-hash-123");
      
      // Store first time
      await documentProof.storeProof(hash);
      
      // Attempt to store again
      await expect(
        documentProof.storeProof(hash)
      ).to.be.revertedWith("Document API: Proof already exists for this hash.");
    });

    it("Should return false for non-existent proof", async function () {
      const hash = ethers.id("non-existent");
      const proof = await documentProof.verifyProof(hash);
      
      expect(proof.owner).to.equal(ethers.ZeroAddress);
      expect(proof.exists).to.equal(false);
      expect(proof.timestamp).to.equal(0);
    });
  });
});
