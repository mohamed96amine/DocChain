import BlockchainService from "./BlockchainService";

class DiagnosticianService extends BlockchainService {
  constructor(contract, accounts, myself) {
    super(contract, accounts, myself);
  }

  mintNft = async (fileCID, tokenURI) => {
    console.log(fileCID);
    console.log(this.myself.address);
    try {
      return await this.contract.methods
        .createDiagnostic(this.myself.address, fileCID, tokenURI)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };
}

export default DiagnosticianService;
