//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';

contract BaseFeeContract is Ownable, ReentrancyGuard, Pausable {
  using SafeMath for uint256;
  using Address for address payable;

  ///  === === === === === State === === === === === ===

  /**
   * Service fee
   */
  uint256 public fee;

  /**
   * Stipend gas of 2300 + 2x Transfer gas of 21000.
   * This gas gets allocated in order to call the minion once the condition has been met
   * This call alone costs 21000 intrinsic gas + ~1500 gas for emmiting an event once the
   * automation fullfiled.
   * The rest goes to refund the chainlink keeper for calling (21000) Automaton plus changes
   * (20000~) in the state of automation once executed.
   */
  uint256 public constant gasOverhead = 21000 + 21000 + 20000 + 2300;


  ///  === === === === === Events === === === === === ===

  event FeeCostChanged(uint256 newValue, uint256 prevValue);
  event FundsReceived(address indexed sender, uint256 amount);


  ///  === === === === === Modifiers === === === === === ===
  modifier whenInitialized() {
    require(fee != 0, 'BaseFee: not initialized');
    _;
  }


  ///  === === === === === Function === === === === === ===
  function initialize(uint initialFee) public {
    require(fee == 0, 'BaseFee: already initialized');
    fee = initialFee ; //150 gwei
  }

  fallback() external payable {
    revert();
  }

  receive() external payable {
    emit FundsReceived(msg.sender, msg.value);
  }

  function pause() public onlyOwner {
    super._pause();
  }

  function unpause() public onlyOwner {
    super._unpause();
  }

  /*
   * Used only when contract is paused by the owner of Automaton
   */
  function changeFeeCost(uint256 newFee) public whenInitialized onlyOwner whenPaused  {
    require(newFee > 0, 'BaseFee: new fee must be more than zero');
    uint256 previousFee = fee;
    fee = newFee;

    emit FeeCostChanged(newFee, previousFee);
  }

  function _chargeFeeAndSendRest(uint256 amount, address payable recipient) internal whenInitialized whenNotPaused {
    address self = address(this);
    require(recipient != address(0), 'BaseFee: invalid recipient address');
    require(recipient != self, 'BaseFee: same address on both ends');
    require(amount >= 0, 'BaseFee: invalid amount value');
    require(msg.value >= amount.add(fee), 'BaseFee: not enough ether send to cover fee cost');
    uint256 startBalance = self.balance;
    Address.sendValue(recipient, amount);
    assert(self.balance == startBalance - amount);
  }

  function _calculateUsableGasFromAmount(uint256 gasPrice, uint256 sendAmount)
    internal
    view
    whenInitialized
    returns (uint256 carriedGas)
  {
    require(msg.value > 0, 'BaseFee: insufficient funds');
    require(gasPrice > 1, 'BaseFee: invalid gas price');

    uint carriedGasCost = msg.value.sub(fee).sub(sendAmount); 
    carriedGas = carriedGasCost.div(gasPrice).sub(gasOverhead);

    require(carriedGas > 0, 'BaseFee: insufficient gas');
  }

  function withdrawFees(uint256 amount) public whenInitialized onlyOwner {
    address self = address(this);
    require(amount <= self.balance, 'BaseFee: insuficient funds');

    if (amount == 0) {
      payable(msg.sender).transfer(self.balance);
    } else {
      payable(msg.sender).transfer(amount);
    }
  }
}
