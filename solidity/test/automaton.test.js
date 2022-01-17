import {catchRevert} from './support/assertRevert';
import {assertEvent, eventValueSelector} from './support/assertEvent';
import {constants} from '@openzeppelin/test-helpers';
const {ZERO_BYTES32, ZERO_ADDRESS} = constants;
const Automaton = artifacts.require('../contracts/Automaton.sol');
const MinionFactory = artifacts.require('../contracts/MinionFactory.sol');
const SimpleStorage = artifacts.require('../contracts/test-helpers/SimpleStorage.sol');
const BN = web3.utils.BN;
const oracle = '0x7940765F07e759ec22994acB3c392FBdcd9c2829';

const getAbiDefinition = (contract, matcher = {}) => {
  return contract.abi.find(def => Object.keys(matcher).every(k => def[k] === matcher[k]));
};

const calculateTxGas = ({gas: estimateGas = 0, payable} = {}) => {
  if (Number(estimateGas) <= 0) {
    return '0';
  }

  const BN = web3.utils.BN;
  const isPayable = !!payable;
  const bnStipendGas = new BN(2300);
  const bnTransferGas = new BN(21000);
  const bnEstimateGas = new BN(estimateGas);

  const totalGas = bnEstimateGas
    .add(bnStipendGas)
    .add(isPayable ? bnTransferGas : new BN(0))
    .toString();
  
  return totalGas;
};

const calculatePayableAmount = ({payable = '0', gas: estimateGas, gasPrice} = {}) => {
  const BN = web3.utils.BN;
  const fee = new BN('160000000000001');

  const bnPayableAmount = new BN(payable);
  const bnGas = new BN(calculateTxGas({gas: estimateGas, payable}));
  const bnGasCost = bnGas.mul(new BN(gasPrice));
  const bnTotalPayableAmount = bnPayableAmount.add(fee).add(bnGasCost).toString();

  return bnTotalPayableAmount;
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
  const initialFee = web3.utils.toWei('1500000', 'gwei');
  const MinionFactoryDeployment = MinionFactory.new();
  let automaton;
  /* create named accounts for contract roles */

  before(async () => {});

  beforeEach(async () => {
    /* before each context */
    const factory = await MinionFactoryDeployment;
    automaton = await Automaton.new();
    await automaton.initialize(factory.address, initialFee);
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

  it('starts with base fee of 1.5M gwei', async () => {
    const fee = await automaton.fee.call();
    assert.equal(fee, web3.utils.toWei('1500000', 'gwei'));
  });

  describe('#setupAutomation', () => {

    it('setups automation', async () => {
      const simpleStorage = await SimpleStorage.new();
      const amount = '0';
      const gasPrice = web3.utils.toWei('2', 'wei');
      const estimatedGas = calculateTxGas({})
      const valueToSend = calculatePayableAmount({gas: estimatedGas, gasPrice})
      const target = simpleStorage.address;
      const comparator = Automaton.enums.Comparator.EQ;
      const actionData = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'set'}), [9]);
      const subject = web3.eth.abi.encodeParameter('uint256', 9);

      
      const tx = await automaton.setupAutomation(target, amount, gasPrice, actionData, subject, comparator, oracle, {value: oneEther});
      const minionAddress = eventValueSelector(tx, 'MinionRegistered', 'minion');
      const expectedAutomation = {
        creator: creatorAddress,
        minion: minionAddress,
        action: {
          data: actionData,
          gasLimit: '499249999999935700',
          gasPrice,
          amount,
          target
        },
        condition: {
          oracle,
          comparator,
          subject
        },
        state: Automaton.enums.State.Open
      }
      assertEvent(tx, 'AutomationCreated', 'setting up an automation should emit an event')
        .withValues([creatorAddress, 1, expectedAutomation], 'should fire with the specific values')
        .withKeys(['creator', 'automationId', 'automation'], 'event should match the key names');
    });
  });

  // describe('checkCondition', () => {
  //   it('returns true for met condition', async () => {
  //     const tx = await automaton.checkCondition(oracle, 60000, Automaton.enums.Comparator.NOT, {from: creatorAddress});
  //     console.log(tx);
  //     assert.equal(tx, true, 'boom');
  //   });
  // })

  // describe('register', async () => {
  //   it('accepts two owners', async () => {
  //     await automaton.register(creatorAddress, firstOwnerAddress);
  //     assert.equal(await automaton.owners(0), creatorAddress, 'did not registered two owners');
  //     assert.equal(await automaton.owners(1), firstOwnerAddress, 'did not registered two owners');
  //   });

  //   it('should run only once', async () => {
  //     await automaton.register(creatorAddress, firstOwnerAddress);
  //     const secondRegistration = automaton.register(creatorAddress, firstOwnerAddress);
  //     await catchRevert(secondRegistration, 'Minion: owners already registered');
  //   });

  //   it('should require creator to be in owners', async () => {
  //     const invalidRegistration = automaton.register(firstOwnerAddress, secondOwnerAddress);
  //     await catchRevert(invalidRegistration, 'Minion: contract creator should be in owners');
  //   });

  //   it('should not allow same owner twice', async () => {
  //     const invalidRegistration = automaton.register(creatorAddress, creatorAddress);
  //     await catchRevert(invalidRegistration, 'Minion: same address for all owners');
  //   });

  //   it('should not allow empty address', async () => {
  //     const invalidRegistration = automaton.register(ZERO_ADDRESS, creatorAddress);
  //     await catchRevert(invalidRegistration, 'Minion: invalid address given');
  //   });
  // });

  // describe('executeOrder', async () => {
  //   it('should not execute order when no owner registered', async () => {
  //     const executionBeforeRegistration = automaton.executeOrder(externalAddress, ZERO_BYTES32, 21000, 0);
  //     await catchRevert(executionBeforeRegistration, 'Minion: contract can not be used before registering');
  //   });

  //   it('should not execute order caller is not in owners', async () => {
  //     await automaton.register(creatorAddress, firstOwnerAddress);
  //     const executionNotFromOwner = automaton.executeOrder(externalAddress, ZERO_BYTES32, 21000, 0, {
  //       from: secondOwnerAddress
  //     });
  //     await catchRevert(executionNotFromOwner, 'Minion: only owners allowed to perform this action');
  //   });

  //   it('should call the method of the deployed contract', async () => {
  //     const simpleStorage = await SimpleStorage.new();
  //     const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'set'}), [9]);

  //     await automaton.register(creatorAddress, firstOwnerAddress);
  //     const {receipt} = await automaton.executeOrder(simpleStorage.address, bytesCommand, 25000, 0);
  //     // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-encodeabi
  //     //https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-estimategas
  //     // assert.equal(await automaton.executeOrder.estimateGas(simpleStorage.address, bytesCommand, 25000, 0), receipt.cumulativeGasUsed);
  //     assert.equal(await simpleStorage.storedData.call(), 9);
  //   });

  //   it('should call a payable method of a deployed contract', async () => {
  //     const simpleStorage = await SimpleStorage.new();
  //     const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'pay'}), [9]);


  //     await automaton.register(creatorAddress, firstOwnerAddress);
  //     await automaton.sendTransaction({value: moreEther});
  //     const ownerBalance = await web3.eth.getBalance(creatorAddress);
  //     await automaton.executeOrder(simpleStorage.address, bytesCommand, 250000, oneEther);

  //     const minionBalance = await web3.eth.getBalance(automaton.address);
  //     const simpleBalance = await web3.eth.getBalance(simpleStorage.address);
  //     const ownerAfterBalance = await web3.eth.getBalance(creatorAddress);

  //     assert.equal(await simpleStorage.storedData.call(), 9, 'the value should be passed');
  //     assert.equal(simpleBalance, oneEther, 'the ether should be passed');
  //   });

  //   it('should revert when contract gets less funds than it should pay for execution of a payable method', async () => {
  //     const simpleStorage = await SimpleStorage.new();
  //     const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'pay'}), [9]);


  //     await automaton.register(creatorAddress, firstOwn  erAddress);
  //     await minion.sendTransaction({value: lessEther});
  //     const ownerBalance = await web3.eth.getBalance(creatorAddress);
  //     const catchNotEnoughFunds = minion.executeOrder(simpleStorage.address, bytesCommand, 250000, oneEther);

  //     const simpleBalance = await web3.eth.getBalance(simpleStorage.address);

  //     catchRevert(catchNotEnoughFunds, 'Minion: insufficient balance');
  //     assert.equal(await simpleStorage.storedData.call(), 0, 'the value should not be set');
  //     assert.equal(simpleBalance, 0, 'there should be no ether');
  //   })
  // });

  // describe('Events', () => {
  //   it('should emit OrderExecuted event when executing an order', async () => {
  //     const simpleStorage = await SimpleStorage.new();
  //     const bytesCommand = web3.eth.abi.encodeFunctionCall(getAbiDefinition(simpleStorage, {name: 'set'}), [9]);

  //     await minion.register(creatorAddress, firstOwnerAddress);
  //     const tx = await minion.executeOrder(simpleStorage.address, bytesCommand, 25000, 0);

  //     assertEvent(tx, 'OrderExecuted', 'executing an order should emit an OrderExecuted event')
  //       .withKeys(
  //         ['minion', 'invoker', 'target', 'result', 'gasLeft'],
  //         'event should match the key names'
  //       );
  //   });

  //   it('should emit ReceivedFund event when receiving ether', async () => {
  //     const tx = await automaton.sendTransaction({value: lessEther, from: creatorAddress});

  //     assertEvent(tx, 'ReceivedFund', 'receiving ether should emit a ReceivedFund event')
  //       .withValues([automaton.address, creatorAddress, lessEther], 'should fire with the specific values')
  //       .withKeys(['automaton', 'payer', 'amount'], 'event should match the key names');
  //   });
  // });
});
