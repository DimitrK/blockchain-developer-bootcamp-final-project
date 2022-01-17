// var automaton = artifacts.require("./Automaton.sol");

// module.exports = function(deployer) {
//   deployer.deploy(automaton);
// };


const path = require('path');
const fs = require('fs');
const Automaton = artifacts.require("./Automaton.sol");
const MinionFactory = artifacts.require("./MinionFactory.sol");

const automatonPath = path.join(__dirname, '..', '..', 'client/app/shared/helpers/network', 'contracts.json');
const contractsContents = fs.readFileSync(automatonPath);
let contracts;
try {
  contracts = JSON.parse(contractsContents);
} catch(e) {
  contracts = {};
}


module.exports = async function(deployer, network) {
  await deployer.deploy(MinionFactory);
  const minionFactory = await MinionFactory.deployed();

  await deployer.deploy(Automaton);
  const automaton = await Automaton.deployed();
  await automaton.initialize(minionFactory.address, 1500000 * 10**9); // 1.500.000gwei fee
  
  if (network === 'test' && contracts.automaton && contracts.automaton[network]) {
    return;
  }

  const address = automaton.address;
  contracts.automaton = {...contracts.automaton, [network]: address};
  fs.writeFileSync(automatonPath, JSON.stringify(contracts) + '\n');
};
