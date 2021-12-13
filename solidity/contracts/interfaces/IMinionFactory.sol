//SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

interface IMinionFactory {
  /**
   * Deploys a new minion contract for the given owner.
   * Passes msg.sender as the creator and the co-owner of the minion
   * @param owner - The address of the real owner of the contract
   * @return minion - The address of the newly deployed minion contract
   */
  function spawn(address owner) external returns(address);
}
