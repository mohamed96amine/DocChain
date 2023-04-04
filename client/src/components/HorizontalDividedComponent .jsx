import React, { useState } from "react";
import { create } from "ipfs-http-client";
import { styled } from "@mui/system";
import db from "../service/db/FireBase";
import useEth from "../contexts/EthContext/useEth";
import { collection, addDoc } from "firebase/firestore";
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  useTheme,
  Link,
} from "@mui/material";
import { tokens } from "../theme";
import { Buffer } from "buffer";
import AddressVerification from "./AddressForm";
import DiagnosticianService from "../service/DiagnosticianService";

const projectId = "2NauIzqJXEf0mJJTnI15MM5DOOg";
const projectSecret = "2232b40ef775dcebab8b98dc3bde5b6b";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const metadata_to_create = {
  name: "Diagnostic",
  description: "diagnostic ",
  pdf: "",
};

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: theme.spacing(2),
}));

const LeftPart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [file, setFile] = useState(null);
  const [fileCID, setFileCID] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const {
    state: { contract, accounts, myself },
  } = useEth();
  const diagnosticianService = new DiagnosticianService(
    contract,
    accounts,
    myself
  );

  const handleChange = (event) => {
    setFile(event.target.files[0]);
  };

  const storeAddress = async (address, id) => {
    try {
      const docRef = await addDoc(collection(db, "addresses"), {
        address: address.properties.label,
        nft_id: id,
      });
      console.log("Address and fileCID stored successfully");
    } catch (error) {
      console.error("Error storing address and fileCID:", error);
    }
  };

  const uploadToIPFS = async () => {
    try {
      if (!file) {
        console.error("No file selected");
        return;
      }
      // Add the document to IPFS
      const document = await client.add(file);
      const path_to_document = document.path;
      setFileCID(path_to_document);
      console.log("Document uploaded to IPFS:", path_to_document);

      // Add the metadata to IPFS
      metadata_to_create["pdf"] = `https://ipfs.io/ipfs/${path_to_document}`;
      const metadata = await client.add(JSON.stringify(metadata_to_create));
      console.log("Metadata uploaded to IPFS:", metadata.path);

      // Mint NFT
      const transaction = await diagnosticianService.mintNft(
        path_to_document,
        metadata.path
      );
      console.log(transaction);
      const nft_id = transaction.events.DiagnosticCreated.returnValues.itemId;
      // store in database
      if (selectedAddress && nft_id) {
        storeAddress(selectedAddress, nft_id);
      } else {
        console.error("No address selected");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const fileURL = fileCID ? `https://ipfs.io/ipfs/${fileCID}` : null;

  return (
    <StyledBox>
      <div>
        <Box sx={{ padding: "140px 10px" }}>
          <Stack spacing={2}>
            <Typography variant="h2">Créer un diagnostic</Typography>
            <AddressVerification
              fileCID={fileCID}
              onAddressSelected={setSelectedAddress}
            />
            <TextField
              type={"file"}
              inputProps={{ accept: "application/pdf" }}
              onChange={handleChange}
            />
            <Button
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 40px",
              }}
              variant="contained"
              onClick={uploadToIPFS}
            >
              Créer
            </Button>
            {fileCID && (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="body1">
                  Accéder au document
                  {/* <a href={fileURL} target="_blank" rel="noopener noreferrer">
                    en cliquant içi.
                  </a> */}
                  <Link
                    href={fileURL}
                    underline="hover"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    en cliquant içi.
                  </Link>
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </div>
    </StyledBox>
  );
};

const RightPart = ({ fileCID }) => {
  return <StyledBox></StyledBox>;
};

const HorizontalDividedComponent = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", borderRadius: "16px" }}>
      <LeftPart />
    </Box>
  );
};

export default HorizontalDividedComponent;
