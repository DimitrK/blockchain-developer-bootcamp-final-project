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
      version: '0.8.6',
    },
  },
  contracts_build_directory: path.join(__dirname, '../client/app/contracts'),
  networks: {
    ropsten: {
      provider: new HDWalletProvider(
        mnemonic,
        process.env.ROPSTEN_PROVIDER_URL,
      ),
      network_id: 3,
      gas: 4612388,
      gasPrice: 100000000000,
    },
    rinkeby: {
      provider: new HDWalletProvider(
        mnemonic,
        process.env.RINKEBY_PROVIDER_URL,
      ),
      network_id: 4,
      gas: 4612388,
      gasPrice: 100000000000,
    },
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '1234', // Match any network id
    },
  },
};
