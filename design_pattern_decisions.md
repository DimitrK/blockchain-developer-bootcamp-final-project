# Overview

I decided to use 3 different entities in the project:

## Automaton:

Automaton is responsible for keeping track of all automations and to who they belong to. Each automation is bound to a
minion instance and one minion can have many automations. Each minion is owned by the creator address of all those
automations. So the first time a user calls the `Automaton#setupAutomation` it creates a minion instance (through
MinionFactory). Automaton is responsible to validate the automation, subtract a fee for the service and forward the rest
of the value sent to the minion. So Automaton does not accumulate nor manages the balance for each user address,
delegates this responsibility to the minion. Automaton should handle the checkUpkeep and performUpkee from Chainlink
Keepers in order to relay to minions the request to execute an automation once a condition has been met.

Automaton also relies in the BaseFeeContract which inherits from to validate that the value sent by the user covers the
payable amount (if any) and the future gas its going to be needed for the specific action (it is being calulated in the
FE)

## Minion

The minion contains the balance of the user address, is responsible for executing the automation function dictated by
either the Automaton or the user address (both of them are owners of the minion). Minion also provides a `receive` and
`withdraw` methods. The first is to add more funds if needed from the owner or anyone else (or any other smart contract
it calls through automation) while withdraw allows the owner to get any funds left

## MinionFactory

Spawns new minions

### Inheritance and Interfaces

Used Interfaces to call contracts such as MinionFactory from Automaton. Used inheritance for automatong based on
`BaseFeeContract`

### Inter-Contract Execution

Minion is literally doing this. Calls an external contract based on the parameters set by the user, once a condition has
been met. There, I am using `openzeppelin/contracts/utils/Address.sol` library to verify the result and using call the
same way as written in the library.

### Access Control Design Patterns (Ownable contracts)

Minion.sol implements access control to limit who can execute a call and who can withdraw funds. Also uses a reentrancy
guard on both functions Automaton.sol implements access control through BaseFeeContract.sol for initializing the
contract and for chaning the fee (it uses also pausable guard in that case)
