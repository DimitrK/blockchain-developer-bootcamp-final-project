import TruffleContract from 'truffle-contract';
import simpleStorageABI from './SimpleStorage.json';

const simpleStorageContract = TruffleContract(simpleStorageABI);

export default function (web3) {
  simpleStorageContract.setProvider(web3.currentProvider);
  [simpleStorageContract.web3.eth.defaultAccount] = web3.eth.accounts;

  return simpleStorageContract.deployed();
}
