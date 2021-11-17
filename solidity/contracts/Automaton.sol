//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./AutomatonMinion.sol";
import "./IAutomatonMinion.sol";


contract Automaton is Ownable, ReentrancyGuard, Pausable {
  using SafeMath for uint256;
  using Address for address payable;

  enum State {
    Open,
    Forwarded,
    Completed,
    Closed,
    Failed
  }

  struct Automation {
    address creator;
    address target;
    address minion;
    bytes data;
    uint gasLimit;
    uint gasCost;
    uint value;
    State state;
  }

  uint storedData;
  uint256 public autoId;
  uint256 public fee = 150000000000000; // 150.000 gwei
  uint256 public feeBalance;

  mapping(address => address) public clientForMinion;
  mapping(uint256 => Automation) public automations;

  event MinionRegistered(address indexed creator);
  event AutomationCreated(address indexed creator, uint automationId);
  event AutomationFailed(address indexed creator, uint automationId);
  event AutomationCompleted(address indexed creator, uint automationId);
  event AutomationValueForwarded(address indexed minion, uint automationId, uint value);
  event Received(address indexed sender, uint amount);

  fallback() external payable {
    revert();
  }

  receive() external payable {
    emit Received(msg.sender, msg.value);
  }

  function pause() public onlyOwner {
    super._pause();
  }

  function unpause() public onlyOwner {
    super._unpause();
  }

  function changeFeeCost(uint newFee) public onlyOwner {
    require(newFee < 0, 'tip was less or equal to zero');
    fee = newFee;
  }

  function withdrawFees(uint amount) public onlyOwner nonReentrant {
    address _this = address(this);
    require(amount > 0, 'invalid amount value');
    require(amount <= feeBalance, 'insuficient tip balance');
    require(amount <= _this.balance, 'insuficient funds');

    if (amount == 0) {
      payable(msg.sender).transfer(_this.balance);
      feeBalance = 0;
    } else {
      payable(msg.sender).transfer(amount);
      feeBalance.sub(amount);
    }
  }

  function _registerMinion() internal returns (address minion) {
    if (clientForMinion[msg.sender] == address(0)) {
      AutomatonMinion _minion = new AutomatonMinion();
      clientForMinion[msg.sender] = address(_minion);
      _minion.register(address(this), msg.sender);
    }

    minion = clientForMinion[msg.sender];

    emit MinionRegistered(minion);
  }

  function setupAutomation(address target, uint value, uint gas, uint gasPrice, bytes memory data) public payable nonReentrant returns (uint) {
    uint stipendGas = 2300;
    uint transferGas = 21000;
    uint totalGasCost = gas.add(stipendGas);
    if (value > 0) {
      totalGasCost.add(transferGas);
    }

    require(gasPrice > 1, 'wrong gas price');
    require(totalGasCost.mul(gasPrice).add(fee).add(value) <= msg.value, 'insufficient funds');
    require(target != address(0), 'invalid address');
    require(target != address(this), 'invalid calling self');
    require(gas > 0, 'gas is required');
    require(gas > 25000, 'gass too low'); //??? Verify tx cost
    address minion = _registerMinion();
    autoId++;
    automations[autoId] = Automation({
      creator: msg.sender,
      target: target,
      minion: minion,
      data: data,
      gasLimit: gas,
      gasCost: totalGasCost.mul(gasPrice),
      value: value,
      state: State.Open
    });

    emit AutomationCreated(msg.sender, autoId);

    forwardAutomationValue(autoId, msg.value.sub(fee));

    executeAutomation(autoId);

    return autoId;
  }

  function forwardAutomationValue(uint _autoId, uint value) internal {
    require(msg.value > value, 'not enought ether send to satisfy this action');
    require(value >= 0);
    uint startBalance = address(this).balance;
    Automation storage automation = automations[_autoId];
    Address.sendValue(payable(automation.minion), value);
    automation.state = State.Forwarded;
    emit AutomationValueForwarded(automation.minion, _autoId, value);
    require(address(this).balance > startBalance - msg.value);
  }

  function executeAutomation(uint _autoId) public returns (bool executed, bytes memory result) {
    Automation storage automation = automations[_autoId];
    (executed, result) = IAutomatonMinion(automation.minion).executeOrder({
      target: automation.target,
      data: automation.data,
      gas: automation.gasCost,
      value: automation.value
    });

    if (executed) {
      automation.state = State.Completed;
      emit AutomationCompleted(automation.creator, _autoId);
    } else {
      automation.state = State.Failed;
      emit AutomationFailed(automation.creator, _autoId);
    }
  }
}

