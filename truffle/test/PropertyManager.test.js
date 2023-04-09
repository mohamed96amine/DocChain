const { expect } = require("chai");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const PropertyManager = artifacts.require("PropertyManager");
const PropertyFactory = artifacts.require("PropertyFactory");
const { BN } = require('@openzeppelin/test-helpers');

contract("PropertyManager", (accounts) => {
  const [owner, propertyOwner, diagnostician, recipient, unregisteredUser] = accounts;
  let propertyManager, propertyFactory;

  beforeEach(async () => {
    propertyFactory = await PropertyFactory.new({ from: owner });
    propertyManager = await PropertyManager.new(propertyFactory.address, { from: owner });
  });

  describe("registerOwner", () => {
    it("should register an owner and emit an event", async () => {
      const registrationFee = await propertyManager.registrationFee();
      const tx = await propertyManager.registerOwner({ from: propertyOwner, value: registrationFee });
      expectEvent(tx, "OwnerRegistered", { ownerAddress: propertyOwner });
      const isRegistered = await propertyManager.registeredOwners(propertyOwner);
      expect(isRegistered).to.be.true;
    });

  });



  describe("requestVerification", () => {
    it("should request verification for diagnostician and emit an event", async () => {
      const tx = await propertyManager.requestVerification("John Doe", "123456789", { from: diagnostician });
      const diagnosticianInfo = await propertyManager.verifiedDiagnostician(diagnostician);
      expect(diagnosticianInfo.pendingVerification).to.be.true;
      expectEvent(tx, "AskedVerification", { diagnosticianAddress: diagnostician });
    });

    it("should revert if diagnostician is already certified", async () => {
      await propertyManager.requestVerification("John Doe", "123456789", { from: diagnostician });
      await propertyManager.verifyDiagnostician(diagnostician, { from: owner });
      await expectRevert(
        propertyManager.requestVerification("John Doe", "123456789", { from: diagnostician }),
        "You're a certified diagnostician"
      );
    });
  });

  describe("verifyDiagnostician", () => {
    beforeEach(async () => {
      await propertyManager.requestVerification("John Doe", "123456789", { from: diagnostician });
    });

    it("should verify diagnostician and emit an event", async () => {
      const tx = await propertyManager.verifyDiagnostician(diagnostician, { from: owner });
      const diagnosticianInfo = await propertyManager.verifiedDiagnostician(diagnostician);
      expect(diagnosticianInfo.isCertified).to.be.true;
      expectEvent(tx, "DiagnosticianCertified", { diagnosticianAddress: diagnostician });
    });

    it("should revert if called by non-owner", async () => {
      await expectRevert(
        propertyManager.verifyDiagnostician(diagnostician, { from: unregisteredUser }),
        "Ownable: caller is not the owner"
      );
    });
  });


  describe("createProperty", () => {
    beforeEach(async () => {
      const registrationFee = await propertyManager.registrationFee();
      await propertyManager.registerOwner({ from: propertyOwner, value: registrationFee });
    });
  
    it("should create a property and emit an event", async () => {
      const tx = await propertyManager.createProperty("Test Property", "TP", { from: propertyOwner });
      const propertyAddress = tx.logs[0].args.property;
      expectEvent(tx, "PropertyCreated", { property: propertyAddress });
    //   console.log(tx);
    //   console.log(propertyAddress);
      const propertyInstance = await propertyFactory.getPropertyContract(propertyAddress);
      console.log(propertyInstance);
      expect(propertyInstance).to.not.be.empty;
    });
  
    it("should revert if called by non-property owner", async () => {
      await expectRevert(
        propertyManager.createProperty("Test Property", "TP", { from: unregisteredUser }),
        "You're not a certified diagnostician"
      );
    });
  });
  
  describe("requestDiagnostic", () => {
    let propertyAddress;
  
    beforeEach(async () => {
      const registrationFee = await propertyManager.registrationFee();
      await propertyManager.registerOwner({ from: propertyOwner, value: registrationFee });
      await propertyManager.requestVerification("John Doe", "123456789", { from: diagnostician });
      await propertyManager.verifyDiagnostician(diagnostician, { from: owner });
      const tx = await propertyManager.createProperty("Test Property", "TP", { from: propertyOwner });
      propertyAddress = tx.logs[0].args.property;
    });
  
    it("should request a diagnostic and emit an event", async () => {
      const tx = await propertyManager.requestDiagnostic(propertyAddress, diagnostician, { from: propertyOwner });
      expectEvent(tx, "DiagnosticRequested", {
        requestId: new BN(0),
        propertyOwner: propertyOwner,
        diagnostician: diagnostician,
        propertyAddress: propertyAddress
      });
    });
  
    it("should revert if called by non-property owner", async () => {
      await expectRevert(
        propertyManager.requestDiagnostic(propertyAddress, diagnostician, { from: unregisteredUser }),
        "You're not a certified diagnostician"
      );
    });
  });
  

  describe("createDiagnostic", () => {
    let propertyAddress;
  
    beforeEach(async () => {
      const registrationFee = await propertyManager.registrationFee();
      await propertyManager.registerOwner({ from: propertyOwner, value: registrationFee });
      await propertyManager.requestVerification("John Doe", "123456789", { from: diagnostician });
      await propertyManager.verifyDiagnostician(diagnostician, { from: owner });
      const tx = await propertyManager.createProperty("Test Property", "TP", { from: propertyOwner });
      propertyAddress = tx.logs[0].args.property;
      await propertyManager.requestDiagnostic(propertyAddress, diagnostician, { from: propertyOwner });
    });
  
    it("should create a diagnostic and emit an event", async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiryDate = now + 86400 * 30;
      const tx = await propertyManager.createDiagnostic(0, "QmHash123", "https://ipfs.io/ipfs/QmHash123", expiryDate, { from: diagnostician });
      expectEvent(tx, "DiagnosticCreated", { property: propertyAddress, tokenId: new BN(0) });
  
      const propertyInstance = await propertyFactory.getPropertyContract(propertyAddress);
      console.log(propertyInstance);
      const hash = await propertyFactory.getDiagnosticHash(propertyInstance, 0);
      expect(hash).to.equal("QmHash123");
    });
  
    it("should revert if called by non-diagnostician", async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiryDate = now + 86400 * 30;
      await expectRevert(
        propertyManager.createDiagnostic(0, "QmHash123", "https://ipfs.io/ipfs/QmHash123", expiryDate, { from: unregisteredUser }),
        "You're not a certified diagnostician"
      );
    });
  
    it("should revert if called before diagnostic request is made", async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiryDate = now + 86400 * 30;
      const newDiagnostician = accounts[5];
      await propertyManager.requestVerification("Jane Doe", "987654321", { from: newDiagnostician });
      await propertyManager.verifyDiagnostician(newDiagnostician, { from: owner });
  
      await expectRevert(
        propertyManager.createDiagnostic(0, "QmHash123", "https://ipfs.io/ipfs/QmHash123", expiryDate, { from: newDiagnostician }),
        "Invalid request ID"
      );
    });
  });
});
