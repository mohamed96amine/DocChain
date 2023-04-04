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

  getDiagnosticianBySiret = async (siret) => {
    try {
      let diagnosticianAddress = await this.contract.methods
        .siretToDiagnostician(siret)
        .call();
      if (diagnosticianAddress) {
        return [diagnosticianAddress, this.getDiagnostician(diagnosticianAddress)]
      }
    } catch (err) {
      console.error(err);
    }
  };

  certifyDiagnostician = async (addr) => {
    try {
      return await this.contract.methods
        .certifyDiagnostician(addr)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };
}

export default OwnerService;
