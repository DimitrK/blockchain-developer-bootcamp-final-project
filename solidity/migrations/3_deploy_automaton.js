// var automaton = artifacts.require("./Automaton.sol");

// module.exports = function(deployer) {
//   deployer.deploy(automaton);
// };


const path = require('path');
const fs = require('fs');
var Automaton = artifacts.require("./Automaton.sol");

const automatonPath = path.join(__dirname, '..', '..', 'client/app/shared/helpers/network', 'contracts.json');
const contractsContents = fs.readFileSync(automatonPath);
let contracts;
try {
  contracts = JSON.parse(contractsContents);
} catch(e) {
  contracts = {};
}


module.exports = async function(deployer, network) {
  await deployer.deploy(Automaton);
  const automaton = await Automaton.deployed();
  const address = automaton.address;
  contracts.automaton = {...contracts.automaton, [network]: address};
  fs.writeFileSync(automatonPath, JSON.stringify(contracts) + '\n');
};
