// Allows us to use ES6 in our migrations and tests.
require('dotenv').config();
require('@babel/register');
require('@babel/polyfill');
const path = require('path');

const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = process.env.HDWALLET_MNEMONIC;

module.exports = {
  compilers: {
    solc: {
      version: '0.8.9'
    }
  },
  contracts_build_directory: path.join(__dirname, '../client/app/contracts'),
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    ropsten: {
      provider: new HDWalletProvider(mnemonic, process.env.ROPSTEN_PROVIDER_URL),
      network_id: 3,
      gas: 4612388,
      gasPrice: 100000000000
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, process.env.RINKEBY_PROVIDER_URL),
      network_id: 4,
      gas: 4612388,
      gasPrice: 100000000000
    },
    development: {
      host: 'localhost',
      port: 8546,
      network_id: 1337,
      gasPrice: 134000000000,
      gas: 4612388
    },
    // used only to differentiate between development/test on migration.
    // Store newly deployed contract address or not to the client side
    test: {
      host: 'localhost',
      port: 8546,
      network_id: 1337,
      gasPrice: 134000000000,
      gas: 4612388
    }
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPriceApi: process.env.ETHERSCAN_API_KEY
        ? `https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=${process.env.ETHERSCAN_API_KEY}`
        : `https://api.etherscan.io/api?module=proxy&action=eth_gasPrice`,
    },
  }
};
