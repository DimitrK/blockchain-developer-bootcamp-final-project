//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
interface IAutomatonMinion {
  function register (address automaton, address client) external;
  function executeOrder(address target, bytes memory data, uint gas, uint value) external returns (bool, bytes memory); 
}
