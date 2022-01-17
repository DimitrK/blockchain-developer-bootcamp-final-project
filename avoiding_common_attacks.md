# Avoiding common attacks

I opted in for the following:

- Using Specific Compiler Pragma SWC-103

- Use Modifiers Only for Validation

- Checks-Effects-Interactions SWC-110

- Proper use of .call and .delegateCall SWC-112, SWC-113

- Re-entrancy SWC-107
  - Used pausable and reentrancy guard on Automation and Minion.sol
- Proper Use of Require, Assert and Revert
- Pull Over Push (not in case of calling the user defined automation though)

- Avoided Tx.Origin Authentication SWC-115
- Avoided Timestamp Dependence SWC-114
