import { AutomationCreated, AutomationCompleted, AutomationFailed } from '../generated/Automaton/Automaton'
import { Automation, Action, Condition } from '../generated/schema'

const makeId = (actor, event) => `${event.address}-${actor}-${event.params.automationId.toString()}`;
const getAutomationId = makeId.bind(null, 'automation');
const getActionId = makeId.bind(null, 'action');
const getConditionId = makeId.bind(null, 'condition');

export function handleNewAutomation(event: AutomationCreated): void {
  let action = new Action(getActionId(event));
  action.data = event.params.automation.action.data;
  action.gasLimit = event.params.automation.action.gasLimit;
  action.gasPrice = event.params.automation.action.gasPrice;
  action.amount = event.params.automation.action.amount;
  action.target = event.params.automation.action.target;
  action.save();
  
  let condition = new Condition(getConditionId(event));
  condition.query = event.params.automation.condition.query;
  condition.oracle = event.params.automation.condition.oracle;
  condition.comparator = event.params.automation.condition.comparator;
  condition.subject = event.params.automation.condition.subject;
  condition.save();

  let automation = new Automation(getAutomationId(event));
  automation.action = action.id;
  automation.condition = condition.id;
  automation.minion = event.params.automation.minion;
  automation.creator = event.params.automation.creator;
  automation.save();
}

export function handleUpdateAutomation(event: AutomationCompleted): void {
  let id = event.params.automationId.toString()
  let automation = Automation.load(id)
  if (automation == null) {
    automation = new Automation(id)
  }
  automation.save()
}
