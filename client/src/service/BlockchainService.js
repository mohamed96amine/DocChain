class BlockchainService {
  constructor(contract, accounts, myself) {
    this.contract = contract;
    this.accounts = accounts;
    this.myself = myself;
  }

  getDiagnostician = async (address) => {
    try {
      return await this.contract.methods.verifiedDiagnostician(address).call();
    } catch (err) {
      console.error(err);
    }
  };
}

export default BlockchainService;
