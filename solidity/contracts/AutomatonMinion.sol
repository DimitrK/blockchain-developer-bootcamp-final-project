
//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./IAutomatonMinion.sol";

contract AutomatonMinion is IAutomatonMinion, ReentrancyGuard {
  using Address for address payable;

  address public creator = msg.sender;
  address[2] public owners;

  event ReceivedFund(address indexed minion, address indexed payer, uint amount);
  event OrderExecuted(address indexed minion, address indexed invoker, address target, bool result, uint gasLeft);

  modifier onlyOwners() {
    require(!_addressesAreEmpty(owners[0], owners[1]), 'Minion: contract can not be used before registering');
    require(owners[0] == msg.sender || owners[1] == msg.sender, 'Minion: only owners allowed to perform this action');
    _;
  }

  /**
   * Checks whether any of the two given addresses are empty
   */
  function _addressesAreEmpty(address first, address second) public pure returns (bool) {
    return first == address(0) || second == address(0);
  }

  function register(address automaton, address client) external {
    require(!_addressesAreEmpty(automaton, client), 'Minion: invalid address given');
    require(_addressesAreEmpty(owners[0], owners[1]), 'Minion: owners already registered');
    require(automaton != client, 'Minion: same address for all owners');
    require(automaton == creator || client == creator, 'Minion: contract creator should be in owners');

    owners[0] = automaton;
    owners[1] = client;
  }

  fallback() external payable {
    revert();
  }

  receive() external payable {
    emit ReceivedFund(address(this), msg.sender, msg.value);
  }

  function withdraw(uint amount) external onlyOwners nonReentrant {
    require(address(this).balance > 0, 'Minion: insufficient funds');
    payable(msg.sender).sendValue(amount);

  }

  function executeOrder(
    address target,
    bytes memory data,
    uint gas,
    uint value
  ) external onlyOwners nonReentrant
    returns (bool success, bytes memory result) {
    require(address(this).balance >= value, "Minion: insufficient balance");

    uint startGas = gasleft();
    (bool _success, bytes memory returndata) = payable(target).call{value: value, gas: gas}(data);
    uint remainingGas = startGas - gasleft();

    result = Address.verifyCallResult(_success, returndata, 'Minion: executing order failed');
    success = result.length == 0;

    emit OrderExecuted(address(this), msg.sender, target, success, remainingGas);
  }
}
