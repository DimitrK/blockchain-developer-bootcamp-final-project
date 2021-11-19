import config from './contracts.json';
import automaton from '../../../contracts/Automaton.json';
import {network} from './constants';

const getAutomatonContract = async () => {
  const chainId = await web3.eth.getChainId();
  const address = config.automaton[network[chainId]];
  const contract = new web3.eth.Contract(automaton.abi, address);
  return contract;
};

export default getAutomatonContract;