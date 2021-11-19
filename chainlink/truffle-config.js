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
      version: '0.4.24',
    },
  },
  contracts_build_directory: path.join(__dirname, '../client/app/contracts'),
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: 1337, // Match any network id
      gasPrice: 134000000000,
      gas: 4612388
    },
  },
};
