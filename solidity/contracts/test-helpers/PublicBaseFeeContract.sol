//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import '../BaseFeeContract.sol';

contract PublicBaseFeeContract is BaseFeeContract {
  function chargeFeeAndSendRest(uint256 amount, address payable receiver)
    public
    payable
  {
    _chargeFeeAndSendRest(amount, receiver);
  }

  function calculateUsableGasFromAmount(uint256 gasPrice, uint256 sendAmount)
    public
    view
    returns (uint256 carriedGas)
  {
    carriedGas = _calculateUsableGasFromAmount(gasPrice, sendAmount);
  }
}
