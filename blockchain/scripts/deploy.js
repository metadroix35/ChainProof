const hre = require("hardhat");

async function main() {
  console.log("Deploying DocumentProof contract...");

  const DocumentProof = await hre.ethers.getContractFactory("DocumentProof");
  const documentProof = await DocumentProof.deploy();

  await documentProof.waitForDeployment();

  const address = await documentProof.getAddress();
  console.log("DocumentProof deployed to:", address);

  console.log(`
=========================================
Deployment Successful!
Contract Address: ${address}
=========================================
  `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
