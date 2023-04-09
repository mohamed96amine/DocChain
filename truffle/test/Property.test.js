const Property = artifacts.require("Property");

contract("Property", (accounts) => {
  let propertyInstance;

  beforeEach(async () => {
    propertyInstance = await Property.new("Property", "PROP");
  });
  describe("DocumentHash", () => {
    it("should set document hash", async () => {
      const tokenId = 0;
      const documentHash = "Qmabc";
      await propertyInstance.safeMint(
        accounts[0],
        "http://example.com/nft",
        Date.now() + 100000
      );
      await propertyInstance.setDocumentHash(tokenId, documentHash);
      const result = await propertyInstance.getDocumentHash(tokenId);
      assert.equal(result, documentHash);
    });

    it("should not set the same document hash twice", async () => {
      const tokenId = 0;
      const documentHash = "Qmabc";
      await propertyInstance.safeMint(
        accounts[0],
        "http://example.com/nft",
        Date.now() + 100000
      );
      await propertyInstance.setDocumentHash(tokenId, documentHash);
      try {
        await propertyInstance.setDocumentHash(tokenId, documentHash);
      } catch (error) {
        assert.equal(
          error.reason,
          "Document hash has already been set for this token ID"
        );
      }
    });
  });
  describe("Mint", () => {
    it("should mint a new token and set the URI", async () => {
      const uri = "http://example.com/nft";
      const expiryDate = Date.now() + 100000;
      await propertyInstance.safeMint(accounts[0], uri, expiryDate);
      const result = await propertyInstance.tokenURI(0);
      assert.equal(result, uri);
    });
    it("should not mint a new token with an expiry date in the past", async () => {
      const uri = "http://example.com/nft";
      const expiryDate = Date.now() - 100000;
      try {
        await propertyInstance.safeMint(accounts[0], uri, expiryDate);
      } catch (error) {
        assert.equal(error.reason, "Expiry date should be in the future");
      }
    });
  });

  describe("isValid", () => {
    it("should check if the token is valid", async () => {
      const uri = "http://example.com/nft";
      const expiryDate = Date.now() + 100000;
      await propertyInstance.safeMint(accounts[0], uri, expiryDate);
      const result = await propertyInstance.isValid(0);
      assert.equal(result, true);
    });
  });
});
