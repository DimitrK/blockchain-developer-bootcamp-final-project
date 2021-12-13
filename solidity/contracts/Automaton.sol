//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import './interfaces/IGanacheChainlinkClient.sol';
import './interfaces/IMinionFactory.sol';
import './interfaces/IMinion.sol';
import './BaseFeeContract.sol';

contract Automaton is BaseFeeContract {
  using SafeMath for uint256;
  enum State {
    Open,
    Forwarded,
    Completed,
    Closed,
    Failed
  }

  enum Comparator {
    EQ,
    GT,
    NOT,
    LT
  }

  struct Condition {
    bytes query;
    address oracle;
    Comparator comparator;
    bytes subject;
  }

  struct Action {
    bytes data;
    uint gasLimit;
    uint gasPrice;
    uint amount;
    address target;
  }

  struct Automation {
    address creator;
    address minion;
    Action action;
    Condition condition;
    State state;
  }

  // struct Automation {
  //   address creator;
  //   address target;
  //   address minion;
  //   bytes data;
  //   uint256 gasLimit;
  //   uint256 gasPrice;
  //   uint256 amount;
  //   State state;
  // }

  IMinionFactory MINION_FACTORY;
  uint256 public autoId;
  uint256 public lastAutoIdChecked;

  mapping(address => address) public clientForMinion;
  mapping(uint256 => Automation) public automations;

  /**
   *  === === === === === Events === === === === === ===
   */
  event MinionRegistered(address indexed creator, address minion);
  event AutomationCreated(address indexed creator, uint256 automationId);
  event AutomationFailed(address indexed creator, uint256 automationId, bytes reason);
  event AutomationCompleted(address indexed creator, uint256 automationId);
  event AutomationValueForwarded(address indexed minion, uint256 automationId, uint256 amount);

  /**
   *  === === === === === Modifiers === === === === === ===
   */
  modifier existingNotFinalAutomation(uint256 _autoId) {
    Automation memory automation = automations[_autoId];
    require(automation.creator != address(0), 'Automaton: invalid automation');
    require(
      automation.state != State.Completed && automation.state != State.Closed && automation.state != State.Failed,
      'Automaton: automation state is final'
    );
    _;
  }

  modifier validExternalAddress(address _address) {
    require(_address != address(0), 'Automaton: invalid address, none passed');
    require(_address != address(this), 'Automaton: invalid address, self passed');
    _;
  }

  /**
   *  === === === === === Functions === === === === === ===
   *
   * Automation functions responsible for running the automaton logic
   */
  function initialize(
    address minionFactoryAddress,
    uint256 initialFee
  ) public validExternalAddress(minionFactoryAddress) {
    require(address(MINION_FACTORY) == address(0), 'Automaton: Already initialized');
    MINION_FACTORY = IMinionFactory(minionFactoryAddress);
    super.initialize(initialFee);
  }

  function _getOrRegisterMinion() internal returns (address minion) {
    address _minion = clientForMinion[msg.sender];
    if (_minion == address(0)) {
      minion = MINION_FACTORY.spawn(msg.sender);
      clientForMinion[msg.sender] = minion;
      emit MinionRegistered(msg.sender, minion);
    } else {
      minion = _minion;
    }
  }

  function _forwardAutomationValue(uint256 amount, uint256 _autoId) internal whenNotPaused {
    Automation storage automation = automations[_autoId];
    require(automation.state == State.Open, 'Automaton: automation already initiated');
    automation.state = State.Forwarded;
    _chargeFeeAndSendRest(amount, payable(automation.minion));
    emit AutomationValueForwarded(automation.minion, _autoId, amount);
  }

  function setupAutomation(
    address target,
    uint256 amount,
    uint256 gasPrice,
    bytes memory data
  ) public payable whenNotPaused validExternalAddress(target) returns (uint256) {
    uint256 usableCarriedGas = _calculateUsableGasFromAmount(amount, gasPrice);

    address minion = _getOrRegisterMinion();

    autoId++;

    Action action = Action({
      target: target,
      data: data,
      gasLimit: usableCarriedGas,
      gasPrice: gasPrice,
      amount: amount,
    });

    automations[autoId] = Automation({
      creator: msg.sender,
      minion: minion,
      action: action,
      state: State.Open
    });

    emit AutomationCreated(msg.sender, autoId);

    _forwardAutomationValue(amount, autoId);

    return autoId;
  }

  // function _getChainlinkValue(address aggregatorAddress) internal validExternalAddress(aggregatorAddress) returns (int256) {
  //   AggregatorV3Interface feed = AggregatorV3Interface(aggregatorAddress);
  //   (uint80 roundID, int256 price, uint256 startedAt, uint256 timeStamp, uint80 answeredInRound) = priceFeed
  //     .latestRoundData();

  //   return price;
  // }

  // function performOracleRequest() public {
  //   IGanacheChainlinkClient(client).request(oracle, job);
  // }

  function checkCondition(
    address oracle,
    Comparator comparator,
    bytes subject
  ) public view returns (bool) {
    require(oracle != address(this), 'Automaton: invalid oracle address');
    require(oracle != address(0), 'Automaton: zero oracle address');
    // require(clientForMinion[msg.sender] != address(0), 'Automaton: you need to create a minion first');
    // IGanacheChainlinkClient(client).requestEthereumPrice(oracle, job);
    
    // It is expected to receive bytes as response. If lt/gt condition check needed
    // will be casted to int256
    bytes response = IOracleFeed(oracle).request();

    if (comparator == Comparator.EQ) {
      if (subject == response) {
        return true;
      }
      return false;
    }

    if (comparator == Comparator.NOT) {
      if (subject != response) {
        return true;
      }
      return false;
    }

    if (comparator == Comparator.GT) {
      int responseDecoded = abi.decode(responseEncoded);
      int subjectDecoded = abi.decode(subject);

      if (subjectDecoded > responseDecoded) {
        return true;
      }
      return false;
    }

    if (comparator == Comparator.LT) {
      int responseDecoded = abi.decode(responseEncoded);
      int subjectDecoded = abi.decode(subject);
      
      if (subjectDecoded < responseDecoded) {
        return true;
      }
      return false;
    }

    return false;
  }

  function executeAutomation(uint256 _autoId)
    public
    whenNotPaused
    nonReentrant
    existingNotFinalAutomation(_autoId)
    returns (bool executed, bytes memory result)
  {
    Automation storage automation = automations[_autoId];

    require(tx.gasprice <= automation.gasPrice);

    (executed, result) = IMinion(payable(automation.minion)).executeOrder({
      target: automation.action.target,
      data: automation.action.data,
      gas: automation.action.gasLimit.mul(automation.gasPrice),
      value: automation.action.amount
    });

    if (executed) {
      automation.state = State.Completed;
      emit AutomationCompleted(automation.creator, _autoId);
    } else {
      automation.state = State.Failed;
      emit AutomationFailed(automation.creator, _autoId, result);
      revert();
    }
  }

  // function checkUpkeep(
  //   bytes calldata checkData
  // )
  //   external
  //   view
  //   returns (
  //     bool upkeepNeeded,
  //     bytes memory performData
  //   ) {
  //     address _oracle;
  //     assembly {
  //       _oracle := calldataload(add(checkData.offset, 20))
  //     }
  //     require(_oracle != address(0));

  //     int value = _getChainlinkValue(_oracle);

  //     uint _currentAutoId = lastAutoIdChecked.add(1);
  //     if (lastAutoIdChecked >= autoId) {
  //       _currentAutoId = 0;
  //     }

  //     Automation memory _auto = automations[_currentAutoId];

  //     while (_auto.oracle != _oracle && _currentAutoId <= autoId && ) {

  //     }
  //   }
  // /**
  //  * @notice method that is actually executed by the keepers, via the registry.
  //  * The data returned by the checkUpkeep simulation will be passed into
  //  * this method to actually be executed.
  //  * @dev The input to this method should not be trusted, and the caller of the
  //  * method should not even be restricted to any single registry. Anyone should
  //  * be able call it, and the input should be validated, there is no guarantee
  //  * that the data passed in is the performData returned from checkUpkeep. This
  //  * could happen due to malicious keepers, racing keepers, or simply a state
  //  * change while the performUpkeep transaction is waiting for confirmation.
  //  * Always validate the data passed in.
  //  * @param performData is the data which was passed back from the checkData
  //  * simulation. If it is encoded, it can easily be decoded into other types by
  //  * calling `abi.decode`. This data should not be trusted, and should be
  //  * validated against the contract's current state.
  //  */
  // function performUpkeep(
  //   bytes calldata performData
  // ) external {

  // }
}
