// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AutomationCompleted extends ethereum.Event {
  get params(): AutomationCompleted__Params {
    return new AutomationCompleted__Params(this);
  }
}

export class AutomationCompleted__Params {
  _event: AutomationCompleted;

  constructor(event: AutomationCompleted) {
    this._event = event;
  }

  get creator(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get automationId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class AutomationCreated extends ethereum.Event {
  get params(): AutomationCreated__Params {
    return new AutomationCreated__Params(this);
  }
}

export class AutomationCreated__Params {
  _event: AutomationCreated;

  constructor(event: AutomationCreated) {
    this._event = event;
  }

  get creator(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get automationId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get automation(): AutomationCreatedAutomationStruct {
    return changetype<AutomationCreatedAutomationStruct>(
      this._event.parameters[2].value.toTuple()
    );
  }
}

export class AutomationCreatedAutomationStruct extends ethereum.Tuple {
  get creator(): Address {
    return this[0].toAddress();
  }

  get minion(): Address {
    return this[1].toAddress();
  }

  get action(): AutomationCreatedAutomationActionStruct {
    return changetype<AutomationCreatedAutomationActionStruct>(
      this[2].toTuple()
    );
  }

  get condition(): AutomationCreatedAutomationConditionStruct {
    return changetype<AutomationCreatedAutomationConditionStruct>(
      this[3].toTuple()
    );
  }

  get state(): i32 {
    return this[4].toI32();
  }
}

export class AutomationCreatedAutomationActionStruct extends ethereum.Tuple {
  get data(): Bytes {
    return this[0].toBytes();
  }

  get gasLimit(): BigInt {
    return this[1].toBigInt();
  }

  get gasPrice(): BigInt {
    return this[2].toBigInt();
  }

  get amount(): BigInt {
    return this[3].toBigInt();
  }

  get target(): Address {
    return this[4].toAddress();
  }
}

export class AutomationCreatedAutomationConditionStruct extends ethereum.Tuple {
  get query(): Bytes {
    return this[0].toBytes();
  }

  get oracle(): Address {
    return this[1].toAddress();
  }

  get comparator(): i32 {
    return this[2].toI32();
  }

  get subject(): Bytes {
    return this[3].toBytes();
  }
}

export class AutomationFailed extends ethereum.Event {
  get params(): AutomationFailed__Params {
    return new AutomationFailed__Params(this);
  }
}

export class AutomationFailed__Params {
  _event: AutomationFailed;

  constructor(event: AutomationFailed) {
    this._event = event;
  }

  get creator(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get automationId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get reason(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }
}

export class AutomationValueForwarded extends ethereum.Event {
  get params(): AutomationValueForwarded__Params {
    return new AutomationValueForwarded__Params(this);
  }
}

export class AutomationValueForwarded__Params {
  _event: AutomationValueForwarded;

  constructor(event: AutomationValueForwarded) {
    this._event = event;
  }

  get minion(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get automationId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class FeeCostChanged extends ethereum.Event {
  get params(): FeeCostChanged__Params {
    return new FeeCostChanged__Params(this);
  }
}

export class FeeCostChanged__Params {
  _event: FeeCostChanged;

  constructor(event: FeeCostChanged) {
    this._event = event;
  }

  get newValue(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get prevValue(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class FundsReceived extends ethereum.Event {
  get params(): FundsReceived__Params {
    return new FundsReceived__Params(this);
  }
}

export class FundsReceived__Params {
  _event: FundsReceived;

  constructor(event: FundsReceived) {
    this._event = event;
  }

  get sender(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class MinionRegistered extends ethereum.Event {
  get params(): MinionRegistered__Params {
    return new MinionRegistered__Params(this);
  }
}

export class MinionRegistered__Params {
  _event: MinionRegistered;

  constructor(event: MinionRegistered) {
    this._event = event;
  }

  get creator(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get minion(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Paused extends ethereum.Event {
  get params(): Paused__Params {
    return new Paused__Params(this);
  }
}

export class Paused__Params {
  _event: Paused;

  constructor(event: Paused) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Unpaused extends ethereum.Event {
  get params(): Unpaused__Params {
    return new Unpaused__Params(this);
  }
}

export class Unpaused__Params {
  _event: Unpaused;

  constructor(event: Unpaused) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Automaton__automationsResultActionStruct extends ethereum.Tuple {
  get data(): Bytes {
    return this[0].toBytes();
  }

  get gasLimit(): BigInt {
    return this[1].toBigInt();
  }

  get gasPrice(): BigInt {
    return this[2].toBigInt();
  }

  get amount(): BigInt {
    return this[3].toBigInt();
  }

  get target(): Address {
    return this[4].toAddress();
  }
}

export class Automaton__automationsResultConditionStruct extends ethereum.Tuple {
  get query(): Bytes {
    return this[0].toBytes();
  }

  get oracle(): Address {
    return this[1].toAddress();
  }

  get comparator(): i32 {
    return this[2].toI32();
  }

  get subject(): Bytes {
    return this[3].toBytes();
  }
}

export class Automaton__automationsResult {
  value0: Address;
  value1: Address;
  value2: Automaton__automationsResultActionStruct;
  value3: Automaton__automationsResultConditionStruct;
  value4: i32;

  constructor(
    value0: Address,
    value1: Address,
    value2: Automaton__automationsResultActionStruct,
    value3: Automaton__automationsResultConditionStruct,
    value4: i32
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    map.set("value2", ethereum.Value.fromTuple(this.value2));
    map.set("value3", ethereum.Value.fromTuple(this.value3));
    map.set(
      "value4",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value4))
    );
    return map;
  }
}

export class Automaton__executeAutomationResult {
  value0: boolean;
  value1: Bytes;

  constructor(value0: boolean, value1: Bytes) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromBoolean(this.value0));
    map.set("value1", ethereum.Value.fromBytes(this.value1));
    return map;
  }
}

export class Automaton extends ethereum.SmartContract {
  static bind(address: Address): Automaton {
    return new Automaton("Automaton", address);
  }

  autoId(): BigInt {
    let result = super.call("autoId", "autoId():(uint256)", []);

    return result[0].toBigInt();
  }

  try_autoId(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("autoId", "autoId():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  automations(param0: BigInt): Automaton__automationsResult {
    let result = super.call(
      "automations",
      "automations(uint256):(address,address,(bytes,uint256,uint256,uint256,address),(bytes,address,uint8,bytes),uint8)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return new Automaton__automationsResult(
      result[0].toAddress(),
      result[1].toAddress(),
      changetype<Automaton__automationsResultActionStruct>(result[2].toTuple()),
      changetype<Automaton__automationsResultConditionStruct>(
        result[3].toTuple()
      ),
      result[4].toI32()
    );
  }

  try_automations(
    param0: BigInt
  ): ethereum.CallResult<Automaton__automationsResult> {
    let result = super.tryCall(
      "automations",
      "automations(uint256):(address,address,(bytes,uint256,uint256,uint256,address),(bytes,address,uint8,bytes),uint8)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Automaton__automationsResult(
        value[0].toAddress(),
        value[1].toAddress(),
        changetype<Automaton__automationsResultActionStruct>(
          value[2].toTuple()
        ),
        changetype<Automaton__automationsResultConditionStruct>(
          value[3].toTuple()
        ),
        value[4].toI32()
      )
    );
  }

  clientForMinion(param0: Address): Address {
    let result = super.call(
      "clientForMinion",
      "clientForMinion(address):(address)",
      [ethereum.Value.fromAddress(param0)]
    );

    return result[0].toAddress();
  }

  try_clientForMinion(param0: Address): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "clientForMinion",
      "clientForMinion(address):(address)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  fee(): BigInt {
    let result = super.call("fee", "fee():(uint256)", []);

    return result[0].toBigInt();
  }

  try_fee(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("fee", "fee():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  gasOverhead(): BigInt {
    let result = super.call("gasOverhead", "gasOverhead():(uint256)", []);

    return result[0].toBigInt();
  }

  try_gasOverhead(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("gasOverhead", "gasOverhead():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  lastAutoIdChecked(): BigInt {
    let result = super.call(
      "lastAutoIdChecked",
      "lastAutoIdChecked():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_lastAutoIdChecked(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "lastAutoIdChecked",
      "lastAutoIdChecked():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  paused(): boolean {
    let result = super.call("paused", "paused():(bool)", []);

    return result[0].toBoolean();
  }

  try_paused(): ethereum.CallResult<boolean> {
    let result = super.tryCall("paused", "paused():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  checkCondition(oracle: Address, comparator: i32, subject: Bytes): boolean {
    let result = super.call(
      "checkCondition",
      "checkCondition(address,uint8,bytes):(bool)",
      [
        ethereum.Value.fromAddress(oracle),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(comparator)),
        ethereum.Value.fromBytes(subject)
      ]
    );

    return result[0].toBoolean();
  }

  try_checkCondition(
    oracle: Address,
    comparator: i32,
    subject: Bytes
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "checkCondition",
      "checkCondition(address,uint8,bytes):(bool)",
      [
        ethereum.Value.fromAddress(oracle),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(comparator)),
        ethereum.Value.fromBytes(subject)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  executeAutomation(_autoId: BigInt): Automaton__executeAutomationResult {
    let result = super.call(
      "executeAutomation",
      "executeAutomation(uint256):(bool,bytes)",
      [ethereum.Value.fromUnsignedBigInt(_autoId)]
    );

    return new Automaton__executeAutomationResult(
      result[0].toBoolean(),
      result[1].toBytes()
    );
  }

  try_executeAutomation(
    _autoId: BigInt
  ): ethereum.CallResult<Automaton__executeAutomationResult> {
    let result = super.tryCall(
      "executeAutomation",
      "executeAutomation(uint256):(bool,bytes)",
      [ethereum.Value.fromUnsignedBigInt(_autoId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Automaton__executeAutomationResult(
        value[0].toBoolean(),
        value[1].toBytes()
      )
    );
  }
}

export class DefaultCall extends ethereum.Call {
  get inputs(): DefaultCall__Inputs {
    return new DefaultCall__Inputs(this);
  }

  get outputs(): DefaultCall__Outputs {
    return new DefaultCall__Outputs(this);
  }
}

export class DefaultCall__Inputs {
  _call: DefaultCall;

  constructor(call: DefaultCall) {
    this._call = call;
  }
}

export class DefaultCall__Outputs {
  _call: DefaultCall;

  constructor(call: DefaultCall) {
    this._call = call;
  }
}

export class ChangeFeeCostCall extends ethereum.Call {
  get inputs(): ChangeFeeCostCall__Inputs {
    return new ChangeFeeCostCall__Inputs(this);
  }

  get outputs(): ChangeFeeCostCall__Outputs {
    return new ChangeFeeCostCall__Outputs(this);
  }
}

export class ChangeFeeCostCall__Inputs {
  _call: ChangeFeeCostCall;

  constructor(call: ChangeFeeCostCall) {
    this._call = call;
  }

  get newFee(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class ChangeFeeCostCall__Outputs {
  _call: ChangeFeeCostCall;

  constructor(call: ChangeFeeCostCall) {
    this._call = call;
  }
}

export class PauseCall extends ethereum.Call {
  get inputs(): PauseCall__Inputs {
    return new PauseCall__Inputs(this);
  }

  get outputs(): PauseCall__Outputs {
    return new PauseCall__Outputs(this);
  }
}

export class PauseCall__Inputs {
  _call: PauseCall;

  constructor(call: PauseCall) {
    this._call = call;
  }
}

export class PauseCall__Outputs {
  _call: PauseCall;

  constructor(call: PauseCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class UnpauseCall extends ethereum.Call {
  get inputs(): UnpauseCall__Inputs {
    return new UnpauseCall__Inputs(this);
  }

  get outputs(): UnpauseCall__Outputs {
    return new UnpauseCall__Outputs(this);
  }
}

export class UnpauseCall__Inputs {
  _call: UnpauseCall;

  constructor(call: UnpauseCall) {
    this._call = call;
  }
}

export class UnpauseCall__Outputs {
  _call: UnpauseCall;

  constructor(call: UnpauseCall) {
    this._call = call;
  }
}

export class WithdrawFeesCall extends ethereum.Call {
  get inputs(): WithdrawFeesCall__Inputs {
    return new WithdrawFeesCall__Inputs(this);
  }

  get outputs(): WithdrawFeesCall__Outputs {
    return new WithdrawFeesCall__Outputs(this);
  }
}

export class WithdrawFeesCall__Inputs {
  _call: WithdrawFeesCall;

  constructor(call: WithdrawFeesCall) {
    this._call = call;
  }

  get amount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class WithdrawFeesCall__Outputs {
  _call: WithdrawFeesCall;

  constructor(call: WithdrawFeesCall) {
    this._call = call;
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get minionFactoryAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get initialFee(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class Initialize1Call extends ethereum.Call {
  get inputs(): Initialize1Call__Inputs {
    return new Initialize1Call__Inputs(this);
  }

  get outputs(): Initialize1Call__Outputs {
    return new Initialize1Call__Outputs(this);
  }
}

export class Initialize1Call__Inputs {
  _call: Initialize1Call;

  constructor(call: Initialize1Call) {
    this._call = call;
  }

  get initialFee(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class Initialize1Call__Outputs {
  _call: Initialize1Call;

  constructor(call: Initialize1Call) {
    this._call = call;
  }
}

export class SetupAutomationCall extends ethereum.Call {
  get inputs(): SetupAutomationCall__Inputs {
    return new SetupAutomationCall__Inputs(this);
  }

  get outputs(): SetupAutomationCall__Outputs {
    return new SetupAutomationCall__Outputs(this);
  }
}

export class SetupAutomationCall__Inputs {
  _call: SetupAutomationCall;

  constructor(call: SetupAutomationCall) {
    this._call = call;
  }

  get target(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get gasPrice(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get data(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get query(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }

  get subject(): Bytes {
    return this._call.inputValues[5].value.toBytes();
  }

  get comparator(): i32 {
    return this._call.inputValues[6].value.toI32();
  }

  get oracle(): Address {
    return this._call.inputValues[7].value.toAddress();
  }
}

export class SetupAutomationCall__Outputs {
  _call: SetupAutomationCall;

  constructor(call: SetupAutomationCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class ExecuteAutomationCall extends ethereum.Call {
  get inputs(): ExecuteAutomationCall__Inputs {
    return new ExecuteAutomationCall__Inputs(this);
  }

  get outputs(): ExecuteAutomationCall__Outputs {
    return new ExecuteAutomationCall__Outputs(this);
  }
}

export class ExecuteAutomationCall__Inputs {
  _call: ExecuteAutomationCall;

  constructor(call: ExecuteAutomationCall) {
    this._call = call;
  }

  get _autoId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class ExecuteAutomationCall__Outputs {
  _call: ExecuteAutomationCall;

  constructor(call: ExecuteAutomationCall) {
    this._call = call;
  }

  get executed(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }

  get result(): Bytes {
    return this._call.outputValues[1].value.toBytes();
  }
}