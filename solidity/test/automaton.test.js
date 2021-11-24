import {catchRevert} from './support/assertRevert';
import {assertEvent} from './support/assertEvent';
import {constants} from '@openzeppelin/test-helpers';
const {ZERO_BYTES32, ZERO_ADDRESS} = constants;
const Automaton = artifacts.require('../contracts/Automaton.sol');
const SimpleStorage = artifacts.require('../contracts/SimpleStorage.sol');
const BN = web3.utils.BN;
const oracle = '0xFCFe6ef77b03402Ccc43Ad2fF3d6cfba8379681d';

const getAbiDefinition = (contract, matcher = {}) => {
  return contract.abi.find(def => Object.keys(matcher).every(k => def[k] === matcher[k]));
};

contract('Automaton', accounts => {
  const creatorAddress = accounts[0];
  const firstOwnerAddress = accounts[1];
  const secondOwnerAddress = accounts[2];
  const externalAddress = accounts[3];
  const unprivilegedAddress = accounts[4];
  const lessEther = web3.utils.toWei('1', 'szabo');
  const oneEther = web3.utils.toWei('1', 'ether');
  const moreEther = web3.utils.toWei('1200', 'finney'); // 1.2eth
  let automaton;
  /* create named accounts for contract roles */

  before(async () => {});

  beforeEach(async () => {
    /* before each context */
    automaton = await Automaton.new();
  });

  it('is has the creator assigned', async () => {
    assert.equal(await automaton.owner(), creatorAddress, 'creator is not correct');
  });

  it('receives ether', async () => {
    const initialBalance = await web3.eth.getBalance(automaton.address);
    assert.deepEqual(new BN(initialBalance), new BN(0), 'automaton has non-zero balance initially');

    await automaton.sendTransaction({from: externalAddress, value: oneEther});

    const newBalance = await web3.eth.getBalance(automaton.address);
    assert.deepEqual(new BN(newBalance), new BN(oneEther), 'automaton did not receive ether');
  });

  it('starts with base fee of 150k gwei', async () => {
    const fee = await automaton.fee.call();
    assert.equal(fee, web3.utils.toWei('150000', 'gwei'));
  });

});
