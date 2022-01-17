//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

// Mock contract to test actions called from automaton
// once a condition has been met
contract SimpleStorage {
  uint public storedData;

  function set(uint x) public {
    storedData = x;
  }

  function pay(uint x) public payable {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}