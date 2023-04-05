const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const DiagnosticManager = artifacts.require("DiagnosticManager");
const DiagnosticToken = artifacts.require("DiagnosticToken");

contract("DiagnosticManager", (accounts) => {
  let diagnosticManager;
  let diagnosticToken;
  const owner = accounts[0];
  const diagnostician1 = accounts[1];
  const diagnostician2 = accounts[2];
  const someone = accounts[3];
  const notCertifiedDiagnostician = accounts[5];
  const pdfHash = "0xabcdef0123456789";
  const tokenURI = "https://example.com";

  beforeEach(async () => {
    diagnosticToken = await DiagnosticToken.new();
    diagnosticManager = await DiagnosticManager.new(diagnosticToken.address, {
      from: owner,
    });
    const DIAGNOSTICIAN_ROLE = await diagnosticToken.DIAGNOSTICIAN_ROLE();
    await diagnosticToken.grantRole(
      DIAGNOSTICIAN_ROLE,
      diagnosticManager.address
    );
  });

  describe("certifyDiagnostician", () => {
    it("should certify the diagnostician", async () => {
      await diagnosticManager.certifyDiagnostician(diagnostician1, {
        from: owner,
      });
      const diagnostician = await diagnosticManager.getDiagnostician(
        diagnostician1
      );
      assert(diagnostician.isCertified === true);
    });

    it("should revert if the diagnostician is already certified", async () => {
      const diagnostician1 = accounts[1];
      await diagnosticManager.certifyDiagnostician(diagnostician1);

      // Try to certify the same diagnostician again and expect it to revert
      await expectRevert(
        diagnosticManager.certifyDiagnostician(diagnostician1),
        "Already certified"
      );
    });
  });

  describe("myself", () => {
    it("should return current diagnostician information", async () => {
      await diagnosticManager.askForVerification("John Doe", "123456", {
        from: diagnostician1,
      });
      await diagnosticManager.certifyDiagnostician(diagnostician1, {
        from: owner,
      });
      const userInfo = await diagnosticManager.myself({ from: diagnostician1 });

      assert(
        userInfo.diagnostician.name !== "",
        "Diagnostician name should not be empty"
      );
      assert(
        userInfo.diagnostician.isCertified === true,
        "Diagnostician should be certified"
      );
      assert(
        userInfo.propertyOwner.properties.length === 0,
        "Property owner should not have any properties"
      );
    });
  });

  describe("getDiagnosticURI", () => {
    it("should return diagnostic URI", async () => {
      await diagnosticManager.certifyDiagnostician(diagnostician1, {
        from: owner,
      });
      const newItemId = await diagnosticManager.createDiagnostic(
        diagnostician1,
        pdfHash,
        tokenURI,
        { from: diagnostician1 }
      );
      const diagnosticURI = await diagnosticManager.getDiagnosticURI(1);
      console.log(diagnosticURI);
      assert(diagnosticURI === tokenURI);
    });
  });

  describe("getDiagnosticHash", () => {
    it("should return diagnostic PDF hash", async () => {
      await diagnosticManager.certifyDiagnostician(diagnostician1, {
        from: owner,
      });
      const newItemId = await diagnosticManager.createDiagnostic(
        diagnostician1,
        pdfHash,
        tokenURI,
        { from: diagnostician1 }
      );
      const diagnosticPDFHash = await diagnosticManager.getDiagnosticHash(1);
      assert(diagnosticPDFHash === pdfHash);
    });
  });

  describe("askForVerification", () => {
    it("should ask for verification", async () => {
      await diagnosticManager.askForVerification("John Doe", "123456", {
        from: notCertifiedDiagnostician,
      });
      const diagnostician = await diagnosticManager.getDiagnostician(
        notCertifiedDiagnostician
      );
      assert(diagnostician.name === "John Doe");
      assert(diagnostician.isCertified === false);
      assert(
        (await diagnosticManager.siretToDiagnostician("123456")) ===
          notCertifiedDiagnostician
      );
      assert.notEqual(
        await diagnosticManager.siretToDiagnostician("987654"),
        notCertifiedDiagnostician
      );
    });

    it("should revert if the diagnostician is already certified", async () => {
      await diagnosticManager.certifyDiagnostician(diagnostician2, {
        from: owner,
      });
      await expectRevert(
        diagnosticManager.askForVerification("John Doe", "789123", {
          from: diagnostician2,
        }),
        "Already certified"
      );
    });
  });

  describe("onlyDiagnosticians", () => {
    it("should revert if the sender is not a certified diagnostician", async () => {
      await expectRevert(
        diagnosticManager.createDiagnostic(diagnostician1, pdfHash, tokenURI, {
          from: someone,
        }),
        "You're not a certified diagnostician"
      );
    });

    it("should create a diagnostic if the sender is a certified diagnostician", async () => {
      await diagnosticManager.certifyDiagnostician(diagnostician2, {
        from: owner,
      });
      const newItemId = await diagnosticManager.createDiagnostic(
        diagnostician2,
        pdfHash,
        tokenURI,
        {
          from: diagnostician2,
        }
      );
      const diagnostic = await diagnosticManager.getDiagnosticURI(1);
      assert(diagnostic === tokenURI);
    });
  });

  describe("Events", () => {
    it("should emit an event DiagnosticianCertified when ceritifying a new diagnostician", async () => {
      const receipt = await diagnosticManager.certifyDiagnostician(
        diagnostician2,
        { from: owner }
      );
      expectEvent(receipt, "DiagnosticianCertified", {
        diagnosticianAddress: diagnostician2,
      });
    });

    it("should emit an event AskedVerification when asking for verification", async () => {
      const receipt = await diagnosticManager.askForVerification(
        "Jane Doe",
        "654321",
        {
          from: notCertifiedDiagnostician,
        }
      );
      expectEvent(receipt, "AskedVerification", {
        diagnosticianAddress: notCertifiedDiagnostician,
      });
    });

    it("should emit an event DiagnosticCreated when creating a diagnostic", async () => {
      await diagnosticManager.certifyDiagnostician(diagnostician1, {
        from: owner,
      });
      const receipt = await diagnosticManager.createDiagnostic(
        diagnostician1,
        pdfHash,
        tokenURI,
        { from: diagnostician1 }
      );
      const newItemId = (await diagnosticManager.getDiagnosticIds()).toString();
      expectEvent(receipt, "DiagnosticCreated", {
        itemId: newItemId,
        diagnosticianAddress: diagnostician1,
        tokenURI: tokenURI,
      });
    });
  });
});
