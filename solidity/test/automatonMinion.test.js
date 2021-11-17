import {catchRevert} from './support/assert-revert';
import {constants} from '@openzeppelin/test-helpers';
const {ZERO_BYTES32, ZERO_ADDRESS} = constants;
const AutomatonMinion = artifacts.require('../contracts/AutomatonMinion.sol');
const SimpleStorage = artifacts.require('../contracts/SimpleStorage.sol');
const BN = web3.utils.BN;

const getAbiDefinition = (contract, matcher = {}) => {
  return contract.abi.find(def => Object.keys(matcher).every(k => def[k] === matcher[k]));
};

contract('AutomatonMinion', accounts => {
  const creatorAddress = accounts[0];
  const firstOwnerAddress = accounts[1];
  const secondOwnerAddress = accounts[2];
  const externalAddress = accounts[3];
  const unprivilegedAddress = accounts[4];
  const lessEther = web3.utils.toWei('1', 'szabo');
  const oneEther = web3.utils.toWei('1', 'ether');
  const moreEther = web3.utils.toWei('1200', 'finney'); // 1.2eth
  let minion;
  /* create named accounts for contract roles */

  before(async () => {});

  beforeEach(async () => {
    /* before each context */
    minion = await AutomatonMinion.new();
  });

  it('is has the creator assigned', async () => {
    assert.equal(await minion.creator.call(), creatorAddress, 'creator is not correct');
  });

  it('receives ether', async () => {
    const initialBalance = await web3.eth.getBalance(minion.address);
    assert.deepEqual(new BN(initialBalance), new BN(0), 'minion has non-zero balance initially');

    await minion.sendTransaction({from: externalAddress, value: oneEther});

    const newBalance = await web3.eth.getBalance(minion.address);
    assert.deepEqual(new BN(newBalance), new BN(oneEther), 'minion did not receive ether');
  });

  describe('register', async () => {
    it('accepts two owners', async () => {
      await minion.register(creatorAddress, firstOwnerAddress);
      assert.equal(await minion.owners(0), creatorAddress, 'did not registered two owners');
      assert.equal(await minion.owners(1), firstOwnerAddress, 'did not registered two owners');
    });

    it('should run only once', async () => {
      await minion.register(creatorAddress, firstOwnerAddress);
      const secondRegistration = minion.register(creatorAddress, firstOwnerAddress);
      await catchRevert(secondRegistration, 'Minion: owners already registered');
    });

    it('should require creator to be in owners', async () => {
      const invalidRegistration = minion.register(firstOwnerAddress, secondOwnerAddress);
      await catchRevert(invalidRegistration, 'Minion: contract creator should be in owners');
    });

    it('should not allow same owner twice', async () => {
      const invalidRegistration = minion.register(creatorAddress, creatorAddress);
      await catchRevert(invalidRegistration, 'Minion: same address for all owners');
    });

    it('should not allow empty address', async () => {
      const invalidRegistration = minion.register(ZERO_ADDRESS, creatorAddress);
      await catchRevert(invalidRegistration, 'Minion: invalid address given');
    });
  });

  describe('executeOrder', async () => {
    it('should not execute order when no owner registered', async () => {
      const executionBeforeRegistration = minion.executeOrder(externalAddress, ZERO_BYTES32, 21000, 0);
      await catchRevert(executionBeforeRegistration, 'Minion: contract can not be used before registering');
    });

    it('should not execute order caller is not in owners', async () => {
      await minion.register(creatorAddress, firstOwnerAddress);
      const executionNotFromOwner = minion.executeOrder(externalAddress, ZERO_BYTES32, 21000, 0, {
        from: secondOwnerAddress
      });
      await catchRevert(executionNotFromOwner, 'Minion: only owners allowed to perform this action');
    });

    it('should call the method of the deployed contract', async () => {
      const simpleStorage = await SimpleStorage.new();
      const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'set'}), [9]);

      await minion.register(creatorAddress, firstOwnerAddress);
      const {receipt} = await minion.executeOrder(simpleStorage.address, bytesCommand, 25000, 0);
      // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-encodeabi
      //https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-estimategas
      // assert.equal(await minion.executeOrder.estimateGas(simpleStorage.address, bytesCommand, 25000, 0), receipt.cumulativeGasUsed);
      assert.equal(await simpleStorage.storedData.call(), 9);
    });

    it('should call a payable method of a deployed contract', async () => {
      const simpleStorage = await SimpleStorage.new();
      const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'pay'}), [9]);


      await minion.register(creatorAddress, firstOwnerAddress);
      await minion.sendTransaction({value: moreEther});
      const ownerBalance = await web3.eth.getBalance(creatorAddress);
      await minion.executeOrder(simpleStorage.address, bytesCommand, 250000, oneEther);

      const minionBalance = await web3.eth.getBalance(minion.address);
      const simpleBalance = await web3.eth.getBalance(simpleStorage.address);
      const ownerAfterBalance = await web3.eth.getBalance(creatorAddress);

      assert.equal(await simpleStorage.storedData.call(), 9, 'the value should be passed');
      assert.equal(simpleBalance, oneEther, 'the ether should be passed');
    });

    it('should revert when contract gets less funds than it should pay for execution of a payable method', async () => {
      const simpleStorage = await SimpleStorage.new();
      const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'pay'}), [9]);


      await minion.register(creatorAddress, firstOwnerAddress);
      await minion.sendTransaction({value: lessEther});
      const ownerBalance = await web3.eth.getBalance(creatorAddress);
      const catchNotEnoughFunds = minion.executeOrder(simpleStorage.address, bytesCommand, 250000, oneEther);

      const simpleBalance = await web3.eth.getBalance(simpleStorage.address);

      catchRevert(catchNotEnoughFunds, 'Minion: insufficient balance');
      assert.equal(await simpleStorage.storedData.call(), 0, 'the value should not be set');
      assert.equal(simpleBalance, 0, 'there should be no ether');
    })
  });
});
