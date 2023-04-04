const DiagnosticManager = artifacts.require("DiagnosticManager.sol");
const DiagnosticToken = artifacts.require("DiagnosticToken.sol");


module.exports = function (deployer) {
  deployer.deploy(DiagnosticToken).then(function(){
    return deployer.deploy(DiagnosticManager, DiagnosticToken.address);
  })
}