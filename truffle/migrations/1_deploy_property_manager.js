const PropertyManager = artifacts.require("PropertyManager.sol");
const PropertyFactory = artifacts.require("PropertyFactory.sol");


module.exports = function (deployer) {
  deployer.deploy(PropertyFactory).then(function(){
    return deployer.deploy(PropertyManager, PropertyFactory.address);
  });
}

