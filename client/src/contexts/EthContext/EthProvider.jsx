import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import UserService from "../../service/UserService";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifact) => {
    if (artifact) {
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      const currentUser = accounts[0];
      const networkID = await web3.eth.net.getId();
      const { abi } = artifact;
      let address, contract, myself;
      let allEvents = [];
      let userService;
      try {
        console.log(networkID);
        console.log(artifact);
        address = artifact.networks[networkID].address;
        console.log(address);
        contract = new web3.eth.Contract(abi, address);
        const owner = await contract.methods.owner().call();
        let fromBlockNumber;
        web3.eth.getBlockNumber().then((blockNumber) => {
          fromBlockNumber = blockNumber;
          });
        allEvents = await contract.getPastEvents("allEvents", {
          fromBlock: fromBlockNumber,
          toBlock: "latest",
        });
        const getMyself = await contract.methods
          .myself()
          .call({ from: currentUser });
        myself = {
          address: currentUser,
          isOwner: currentUser === owner,
          isCertified: !!getMyself?.diagnostician.isCertified,
          siret: !!getMyself?.diagnostician.siret,
        };
        userService = new UserService(contract, accounts, myself);
      } catch (err) {
        console.error(err);
      }
      dispatch({
        type: actions.init,
        data: {
          artifact,
          web3,
          accounts,
          networkID,
          contract,
          myself,
          userService, 
          allEvents: allEvents,
        },
      });
    }
  }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/DiagnosticManager.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
