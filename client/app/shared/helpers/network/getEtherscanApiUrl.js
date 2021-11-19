import {network} from './constants';

const getEtherscanApiUrl = async () => {
  const chainId = await web3.eth.getChainId();
  let etherscanUrl = process.env.ETHERSCAN_API_KEY;

  switch (chainId) {
    case '3':
    case '4':
    case '5':
    case '42':
      return etherscanUrl.replace('https://api.', `https://api-${network[chain]}`);
    case '1':
    default:
      return etherscanUrl;
  }

};

export default getEtherscanApiUrl;

