/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const PropertyManager = artifacts.require("PropertyManager.sol");
const PropertyFactory = artifacts.require("PropertyFactory.sol");

module.exports = async function (callback) {
  const deployed = await PropertyManager.deployed();
  const accounts = await web3.eth.getAccounts();

  // Use the accounts for your script
  console.log("Accounts:", accounts);
  const owner = accounts[0];
  const diagnostician_1 = accounts[1];
  const diagnostician_2 = accounts[2];
  const propertyOwner = accounts[3];
  const tx_1 = await deployed.requestVerification("John Doe", "123456789", { from: diagnostician_1 });
  console.log(tx_1);
  callback();
};
