import React, { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import { styled } from "@mui/system";
import useEth from "../contexts/EthContext/useEth";
import db from "../service/db/FireBase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import {
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  Table,
  Paper,
  TableContainer,
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
  const [requests, setRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    state: { userService },
  } = useEth();

  const handleChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    getDiagnosticRequests();
  }, [userService]);

  const getDiagnosticRequests = async () => {
    const result = await userService.getDiagnosticRequests();
    
    const promises = result.map((item) =>
      findPropertiesByContractAddress(item.property)
    );
    const resolvedProperties = await Promise.all(promises);
    const mappedResult = result.map((item, index) => ({
      requestId: index,
      isCompleted: item.isCompleted,
      propertyOwner: item.propertyOwner,
      property: resolvedProperties[index][0],
    }));
    console.log(mappedResult);
    
    setRequests(mappedResult);
  };

  const findPropertiesByContractAddress = async (contractAddress) => {
    const propertiesRef = collection(db, "properties");
    const q = query(
      propertiesRef,
      where("contractAddress", "==", contractAddress)
    );
    const querySnapshot = await getDocs(q);
    const matchingProperties = [];
    querySnapshot.forEach((doc) => {
      matchingProperties.push({ id: doc.id, ...doc.data() });
    });
    return matchingProperties;
  };

  const storeAddress = async (address, id) => {
    try {
      const docRef = await addDoc(collection(db, "addresses"), {
        address: address,
        nft_id: id,
      });
      console.log("Address and fileCID stored successfully");
    } catch (error) {
      console.error("Error storing address and fileCID:", error);
    }
  };

  const uploadToIPFS = async (requestId, physicalAddress) => {
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
      // const expiryDate = Math.floor(selectedDate.getTime() / 1000);
      console.log(selectedDate);
      const transaction = await userService.createDiagnostic(
        requestId,
        path_to_document,
        metadata.path,
        selectedDate
      );
      console.log(physicalAddress);
      console.log(transaction);
      const nft_id = transaction.events.DiagnosticCreated.returnValues.tokenId;
      console.log(nft_id);
      // store in database
      if (physicalAddress && nft_id) {
        storeAddress(physicalAddress, nft_id);
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
        <Box sx={{ padding: "70px 10px" }}>
          <Stack spacing={2}>
            <Typography variant="h2">Créer un diagnostic</Typography>
          </Stack>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Adresse</TableCell>
                <TableCell>Le diagnostic</TableCell>
                <TableCell>Expire le</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((item) => (
                <TableRow key={item.property.id}>
                  <TableCell>{item.property.physicalAddress}</TableCell>
                  <TableCell>
                    <TextField
                      type={"file"}
                      inputProps={{ accept: "application/pdf" }}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="date"
                      value={selectedDate.toISOString().substring(0, 10)}
                      onChange={handleDateChange}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      {!item.isCompleted && (
                        <Button
                          sx={{
                            backgroundColor: colors.blueAccent[700],
                            color: colors.grey[100],
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "10px 40px",
                          }}
                          variant="contained"
                          onClick={() => uploadToIPFS(item.requestId, item.property.physicalAddress)}
                        >
                          Émettre
                        </Button>
                      )}
                      {item.isCompleted && (
                        <Typography>Diagnostic réalisé</Typography>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
      </div>
    </StyledBox>
  );
};

const HorizontalDividedComponent = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", borderRadius: "16px" }}>
      <LeftPart />
    </Box>
  );
};

export default HorizontalDividedComponent;
