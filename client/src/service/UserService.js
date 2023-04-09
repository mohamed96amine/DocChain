import BlockchainService from "./BlockchainService";
import Web3 from "web3";

class UserService extends BlockchainService {
  constructor(contract, accounts, myself) {
    super(contract, accounts, myself);
  }


  askForVerification = async (name, siret) => {
    try {
      return await this.contract.methods
        .requestVerification(name, siret)
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

  addProperty = async (name) => {
    try {
      return await this.contract.methods
        .addProperty(name)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  registerPropertyOwner = async () => {
    try {
      return await this.contract.methods
        .registerPropertyOwner()
        .send({
          from: this.myself.address,
          value: this.web3.utils.toWei("0.1", "ether"),
        });
    } catch (err) {
      console.error(err);
    }
  };

  requestDiagnosticFrom = async (propertyId, diagnosticianAddress) => {
    try {
      return await this.contract.methods
        .requestDiagnosticFrom(propertyId, diagnosticianAddress)
        .send({
          from: this.accountAddress,
          value: Web3.utils.toWei("0.1", "ether"),
        });
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
        return [
          diagnosticianAddress,
          this.getDiagnostician(diagnosticianAddress),
        ];
      }
    } catch (err) {
      console.error(err);
    }
  };

  getDiagnosticRequests = async () => {
    const requests = [];
    for (let i = 0; ; i++) {
      try {
        const request = await this.contract.methods.diagnosticRequests(this.myself.address, i).call();
        requests.push(request);
      } catch (err) {
        break; // break the loop if an error is caught
      }
    }
    return requests;
  };

  certifyDiagnostician = async (addr) => {
    try {
      return await this.contract.methods
        .verifyDiagnostician(addr)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  registerOwner = async () => {
    try {
      return await this.contract.methods
        .registerOwner()
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  registerOwner = async () => {
    try {
      return await this.contract.methods
        .registerOwner()
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  requestDiagnostic = async (property, diagnostician) => {
    try {
      return await this.contract.methods
        .requestDiagnostic(diagnostician)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  getUserProperties = async () => {
    try {
      return await this.contract.methods.getUserProperties().call();
    } catch (err) {
      console.error(err);
    }
  };

  createProperty = async (name, symbol) => {
    try {
      return await this.contract.methods
        .createProperty(name, symbol)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };


  requestDiagnostic= async (property, diagnostician) => {
    try {
      return await this.contract.methods
        .requestDiagnostic(property, diagnostician)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };

  createDiagnostic = async (requestId, fileCID, tokenURI, date) => {
    // const expiryDate = Math.floor(date.getTime() / 1000); 
    const expiryDate = Math.floor(new Date("2023-08-08T00:00:00Z").getTime() / 1000);
    try {
      return await this.contract.methods
        .createDiagnostic(requestId, fileCID, tokenURI, expiryDate)
        .send({ from: this.myself.address });
    } catch (err) {
      console.error(err);
    }
  };
  

  getDiagnosticHash = async (property, tokenId) => {
    try {
      return await this.contract.methods.getDiagnosticHash(property, tokenId).call();
    } catch (err) {
      console.error(err);
    }
  };
}

export default UserService;
