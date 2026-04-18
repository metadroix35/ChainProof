require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../.env' }); // Load from root .env

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const RPC_URL = process.env.RPC_URL || process.env.AMOY_RPC_URL || "https://rpc.sepolia.org";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  }
};
