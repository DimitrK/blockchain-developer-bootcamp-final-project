import {catchRevert} from './support/assertRevert';
import {assertEvent} from './support/assertEvent';
import {constants} from '@openzeppelin/test-helpers';
const {ZERO_BYTES32, ZERO_ADDRESS} = constants;
const BaseFeeContract = artifacts.require('../contracts/test-helpers/PublicBaseFeeContract.sol');
const BN = web3.utils.BN;

contract('BaseFeeContract', accounts => {
  const [creatorAddress, firstOwnerAddress, secondOwnerAddress, externalAddress, unprivilegedAddress] = accounts;
  const lessEther = web3.utils.toWei('1', 'szabo');
  const oneEther = web3.utils.toWei('1', 'ether');
  const moreEther = web3.utils.toWei('1200', 'finney'); // 1.2eth
  const initialFee = web3.utils.toWei('1', 'gwei');
  const oneWei = web3.utils.toWei('1', 'wei'); // 1
  let baseContract;
  /* create named accounts for contract roles */

  before(async () => {});

  beforeEach(async () => {
    /* before each context */
    baseContract = await BaseFeeContract.new();
    await baseContract.initialize(initialFee);
  });

  it('should have the creator assigned', async () => {
    assert.equal(await baseContract.owner(), creatorAddress, 'creator is not correct');
  });

  it('should receive ether', async () => {
    const initialBalance = await web3.eth.getBalance(baseContract.address);
    assert.deepEqual(new BN(initialBalance), new BN(0), 'baseContract has non-zero balance initially');

    await baseContract.sendTransaction({from: externalAddress, value: oneEther});

    const newBalance = await web3.eth.getBalance(baseContract.address);
    assert.deepEqual(new BN(newBalance), new BN(oneEther), 'baseContract did not receive ether');
  });

  it('should start with base fee of 1 gwei', async () => {
    const fee = await baseContract.fee.call();
    assert.equal(fee, web3.utils.toWei('1', 'gwei'));
  });

  it('should get initialized only once', async () => {
    const reInit = baseContract.initialize(initialFee);
    await catchRevert(reInit, 'BaseFee: already initialized');
  });

  describe('#changeFeeCost(uint)', () => {
    it('should allow fee changes only when paused', async () => {
      const newAmount = web3.utils.toWei('500000', 'gwei');
      const changeFeeAction = baseContract.changeFeeCost(newAmount);
      await catchRevert(changeFeeAction, 'Pausable: not paused');
    });

    it('should not accept fee of zero or less', async () => {
      await baseContract.pause();
      const zeroFee = baseContract.changeFeeCost(0);
      await catchRevert(zeroFee, 'BaseFee: new fee must be more than zero');
    });

    it('changes the fee to the set amount', async () => {
      const newAmount = web3.utils.toWei('500000', 'gwei');
      await baseContract.pause();
      await baseContract.changeFeeCost(newAmount);
      const fee = await baseContract.fee.call();
      assert.equal(fee, newAmount, 'contract fee should be changed to new fee value');
    });

    it('should not allow fee changes before initialization', async () => {
      const newAmount = web3.utils.toWei('500000', 'gwei');
      const newBaseContract = await BaseFeeContract.new();
      await newBaseContract.pause();
      const changeFeeAction = newBaseContract.changeFeeCost(newAmount);
      await catchRevert(changeFeeAction, 'BaseFee: not initialized');
    });
  });

  describe('#chargeFeeAndSendRest(uint, address)', () => {
    it('should send to address the amount while withholding the fee', async () => {
      const netSentAmount = oneWei;
      const sentAmount = new BN(initialFee).add(new BN(netSentAmount)).toString();
      const receiver = accounts[accounts.length - 1];
      const initialBalance = await web3.eth.getBalance(receiver);

      const contractInitialBalance = await web3.eth.getBalance(baseContract.address);

      await baseContract.chargeFeeAndSendRest(netSentAmount, receiver, {
        value: sentAmount,
        from: creatorAddress
      });
      const actualNewBalance = await web3.eth.getBalance(receiver);
      const expectedNewBalance = new BN(initialBalance).add(new BN(netSentAmount)).toString();
      const contractNewBalance = await web3.eth.getBalance(baseContract.address);

      assert.equal(actualNewBalance, expectedNewBalance, 'should sent the exact amount specified in the call');
      assert.equal(contractNewBalance, initialFee, 'contract should have the fee in its balance');
    });

    it(`should not allow sending less wei than fee (${initialFee} wei)`, async () => {
      const sentAmount = new BN(initialFee).sub(new BN(oneWei));
      const receiver = accounts[accounts.length - 1];
      const chargeFeeAction = baseContract.chargeFeeAndSendRest(sentAmount, receiver, {
        value: sentAmount,
        from: creatorAddress
      });

      await catchRevert(chargeFeeAction, 'BaseFee: not enough ether send to cover fee cost');
    });

    it('should allow sending 0 wei plus fee', async () => {
      const netSentAmount = 0;
      const sentAmount = initialFee;
      const receiver = accounts[accounts.length - 1];
      const initialBalance = await web3.eth.getBalance(receiver);
      await baseContract.chargeFeeAndSendRest(netSentAmount, receiver, {
        value: sentAmount,
        from: creatorAddress
      });

      const actualNewBalance = await web3.eth.getBalance(receiver);
      const contractNewBalance = await web3.eth.getBalance(baseContract.address);

      assert.equal(initialBalance, actualNewBalance, 'contract balance should rename the same for zero amount sent');
      assert.equal(contractNewBalance, initialFee, 'contract should have the fee in its balance');
    });

    it('should not allow sending to 0x0 or same address as the sender', async () => {
      const sentAmount = new BN(initialFee).add(new BN(oneWei));
      const zeroAddressReceiver = ZERO_ADDRESS;
      const zeroAddressChargeFeeAction = baseContract.chargeFeeAndSendRest(oneWei, zeroAddressReceiver, {
        value: sentAmount,
        from: creatorAddress
      });
      await catchRevert(zeroAddressChargeFeeAction, 'BaseFee: invalid recipient address');
    });
  });

  describe('#withdrawFees(uint256)', () => {
    it('should withdraw all amount if passed zero', async () => {
      await baseContract.sendTransaction({from: externalAddress, value: oneEther});
      const initialFeeBalance = await web3.eth.getBalance(baseContract.address);
      await baseContract.withdrawFees(0);
      const newBalance = await web3.eth.getBalance(baseContract.address);
      assert.notEqual(initialFeeBalance, newBalance);
      assert.equal(newBalance, 0);
    });

    it('should withdraw all amount if passed a specific amount', async () => {
      await baseContract.sendTransaction({from: externalAddress, value: oneWei + oneWei}); // 11 wei

      const initialFeeBalance = await web3.eth.getBalance(baseContract.address);
      await baseContract.withdrawFees(oneWei); // - 1 wei
      const newBalance = await web3.eth.getBalance(baseContract.address);
      assert.notEqual(initialFeeBalance, newBalance);
      assert.equal(newBalance, oneWei + '0'); // 10 wei expected
    });

    it('should not allow withdrawal from other than the owner', async () => {
      await baseContract.sendTransaction({from: externalAddress, value: oneWei});
      const withdrawAction = baseContract.withdrawFees(oneWei, {from: externalAddress});
      await catchRevert(withdrawAction);
    });

    it('should not allow withdrawing more than the available balance', async () => {
      await baseContract.sendTransaction({from: externalAddress, value: oneWei});
      const withdrawAction = baseContract.withdrawFees(oneEther);
      await catchRevert(withdrawAction, 'BaseFee: insuficient funds');
    });
  });
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
