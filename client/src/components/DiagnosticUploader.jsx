import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { create } from "ipfs-http-client";
import Web3 from "web3";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
// import front from '../assets/front-card.png';


const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

const NFTUploader = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [file, setFile] = useState(null);

  const handleChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const uploadToIPFS = async () => {
    try {
      if (!file) {
        console.error("No file selected");
        return;
      }

      const added = await client.add(file);
      console.log("File uploaded to IPFS:", added.path);
      mintNFT(added.path);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const mintNFT = async (ipfsHash) => {
    // Set up Web3 provider and smart contract ABI and address
    const provider = new Web3.providers.HttpProvider(
      "https://rinkeby.infura.io/v3/YOUR-INFURA-PROJECT-ID"
    );
    const web3 = new Web3(provider);
    const abi = []; // Smart contract ABI
    const contractAddress = "0x..."; // Smart contract address
    const account = "0x..."; // Your Ethereum account address

    // Initialize the smart contract
    const contract = new web3.eth.Contract(abi, contractAddress);

    // Estimate the gas required for minting the NFT
    const gas = await contract.methods.mint(account, ipfsHash).estimateGas();

    // Mint the NFT
    contract.methods
      .mint(account, ipfsHash)
      .send({ from: account, gas })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
      })
      .on("receipt", (receipt) => {
        console.log("Minted NFT:", receipt);
      })
      .on("error", (error) => {
        console.error("Error minting NFT:", error);
      });
  };

  return (
    <Box>
      <Paper elevation={1}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card
              onClick={handleClick}
              className={`flip-card ${isFlipped ? "flipped" : ""}`}
            >
              <CardContent className="flip-card-front">
                <Typography variant="h6">Upload a Diagnostic PDF</Typography>
                <TextField
                  type={"file"}
                  inputProps={{ accept: "application/pdf" }}
                  onChange={handleChange}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={uploadToIPFS}
                >
                  Créer le diagnostic
                </Button>
              </CardContent>
              <CardContent className="flip-card-back">
                <Typography variant="h5">Minted</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card
              className={`flip-card ${isFlipped ? "flipped" : ""}`}
              sx={{ maxWidth: 500 }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image="/assets/front-card.png"
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Lizard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default NFTUploader;
