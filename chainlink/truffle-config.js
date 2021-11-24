// Allows us to use ES6 in our migrations and tests.
require('@babel/register');
require('@babel/polyfill');
const path = require('path');

module.exports = {
  compilers: {
    solc: {
      version: '0.4.24',
    },
  },
  contracts_build_directory: path.join(__dirname, '../client/app/contracts/chainlink'),
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8546,
      network_id: 1337,
      gasPrice: 134000000000,
      gas: 4612388
    },
  },
};
