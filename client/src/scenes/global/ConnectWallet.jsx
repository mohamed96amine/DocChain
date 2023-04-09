import { Button, useTheme } from "@mui/material";
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import { tokens } from "../../theme";
import useEth from "../../contexts/EthContext/useEth";


function ConnectWallet() {
    const [isConnected, setIsConnected] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [address, setAddress] = useState('');

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
        // Check if the user is connected to MetaMask
        if (window.ethereum && address === null) {
          setIsConnected(true);
          setWeb3(new Web3(window.ethereum));
          setAddress(window.ethereum.selectedAddress);
        } else {
          setIsConnected(false);
        }
      }, []);
    
    const connectWallet = async () => {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setIsConnected(true);
          setWeb3(new Web3(window.ethereum));
          setAddress(window.ethereum.selectedAddress);
        } catch (error) {
          console.log(error);
        }
    };

    const formattedAddress = address => {
      if (address != null){
        return address.substr(0, 2) + "..." + address.substr(-8) + " ";
      }
      return address;
    }

    return (
    <div>
        {!isConnected && (
            <Button onClick={connectWallet}
            sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",fontWeight: "bold",padding: "10px 20px",
            }}>
            <WalletOutlinedIcon sx={{ mr: "10px" }} /> Connect Wallet
            
        </Button>
            ) 
        }
        {isConnected && (
            <div>
                <Button disabled
                    sx={{
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "14px",fontWeight: "bold",padding: "10px 20px",
                    }}>
                <WalletOutlinedIcon sx={{ mr: "10px" }} /> Connected : {formattedAddress(address)}
            
                </Button>
          </div>
        )}
    
    </div>
    );
  }
  
  export default ConnectWallet;
  

