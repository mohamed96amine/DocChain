import BlockchainService from "./BlockchainService";

class OwnerService extends BlockchainService {
  constructor(contract, accounts, myself) {
    super(contract, accounts, myself);
  }

  getOwner = async () => {
    try {
      return await this.contract.methods.owner().call();
    } catch (err) {
      console.error(err);
    }
  };


}

export default OwnerService;
