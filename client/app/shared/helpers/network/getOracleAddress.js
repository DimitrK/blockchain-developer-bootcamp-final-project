import config from './contracts.json';
import {network} from './constants';

const getOracleAddress = async () => {
  const chainId = await web3.eth.getChainId();
  const address = config.oracle[network[chainId]];
  return address;
};

export default getOracleAddress;