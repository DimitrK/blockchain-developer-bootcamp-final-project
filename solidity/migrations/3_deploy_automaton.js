var automaton = artifacts.require("./Automaton.sol");

module.exports = function(deployer) {
  deployer.deploy(automaton);
};
