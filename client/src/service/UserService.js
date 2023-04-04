import BlockchainService from "./BlockchainService";

class UserService extends BlockchainService {
  constructor(contract, accounts, myself) {
    super(contract, accounts, myself);
  }

  askForVerification = async (name, siret) => {
    try {
      return await this.contract.methods
        .askForVerification(name, siret)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  getPdfHash = async (tokenId) => {
    try {
      return await this.contract.methods.getDiagnosticHash(tokenId).call();
    } catch (err) {
      console.error(err);
    }
  };
}

export default UserService;
