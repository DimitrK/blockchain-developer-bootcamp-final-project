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
    uint amount;
    State state;
  }

  uint storedData;
  uint256 public autoId;
  uint256 public fee = 150000000000000; // 150.000 gwei
  uint256 public feeBalance;

  mapping(address => address) public clientForMinion;
  mapping(uint256 => Automation) public automations;

  event MinionRegistered(address indexed creator, address indexed minion);
  event AutomationCreated(address indexed creator, uint automationId);
  event AutomationFailed(address indexed creator, uint automationId);
  event AutomationCompleted(address indexed creator, uint automationId);
  event AutomationValueForwarded(address indexed minion, uint automationId, uint amount);
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

    emit MinionRegistered(address(this), minion);
  }


  function _forwardAutomationValue(uint _autoId, uint amount) internal {
    require(msg.value > amount, 'not enought ether send to satisfy this action');
    require(amount >= 0);
    uint startBalance = address(this).balance;
    Automation storage automation = automations[_autoId];
    Address.sendValue(payable(automation.minion), amount);
    automation.state = State.Forwarded;
    emit AutomationValueForwarded(automation.minion, _autoId, amount);
    require(address(this).balance > startBalance - msg.value);
  }

  function setupAutomation(address target, uint amount, uint gasPrice, bytes memory data) public payable nonReentrant returns (uint) {
    require(target != address(0), 'invalid address');
    require(msg.value > 0, 'insufficient funds');
    require(gasPrice > 1, 'invalid gas price');
    require(target != address(this), 'invalid calling self');

    uint stipendGas = 2300;
    uint transferGas = 21000;
    uint carriedGasCost = msg.value.sub(fee).sub(amount);
    uint carriedGas = carriedGasCost.div(gasPrice, 'overflow');
    require(carriedGas > 0, 'insufficient gas');
    require(carriedGas >= stipendGas, 'insufficient stipend gas');
    if (amount > 0 && carriedGas < stipendGas.add(transferGas)) {
      revert('insufficient stipend+transfer gas');
    }

    address minion = _registerMinion();
    autoId++;
    automations[autoId] = Automation({
      creator: msg.sender,
      target: target,
      minion: minion,
      data: data,
      gasLimit: carriedGas,
      gasCost: carriedGasCost,
      amount: amount,
      state: State.Open
    });

    emit AutomationCreated(msg.sender, autoId);

    _forwardAutomationValue(autoId, msg.value.sub(fee));

    executeAutomation(autoId);

    return autoId;
  }


  function executeAutomation(uint _autoId) public returns (bool executed, bytes memory result) {
    Automation storage automation = automations[_autoId];
    (executed, result) = IAutomatonMinion(automation.minion).executeOrder({
      target: automation.target,
      data: automation.data,
      gas: automation.gasCost,
      value: automation.amount
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

