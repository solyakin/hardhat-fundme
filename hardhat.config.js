require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: {
    compilers : [
      { version : "0.8.8"},
      { version : "0.6.6"}
    ],
  },
  defaultNetwork : "hardhat",
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL || "",
      accounts: [PRIVATE_KEY],
      chainId : 4,
      blockConfirmations : 6,
    },
  },
  gasReporter : {
    enabled : true,
    outputFile : "gas-report.txt",
    noColors : true,
    // currency : "USD",
    // coinmarketcap : "",
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY,
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
    },
  },
  user : {
    default : 1,
  }
};
