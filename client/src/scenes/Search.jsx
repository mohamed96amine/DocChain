import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Container } from "@mui/material";
import { styled } from "@mui/system";
import AddressSearchBox from "../components/AddressSearchBox";
import PDFPreviewCard from "../components/PDFPreviewCard";
import db from "../service/db/FireBase";
import { collection, query, where, getDocs } from "firebase/firestore";
import useEth from "../contexts/EthContext/useEth";

const StyledBox = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));



const FindDiagnosticsPage = () => {
  const {
    state: { userService },
  } = useEth();
  const [pdfFiles, setPdfFiles] = useState([]);
  const ipfs_url =
  "https://ipfs.io/ipfs/";

  const getNftIdFromDb = async (address) => {
    try {
      const addressesRef = collection(db, "addresses");
      const q = query(addressesRef, where("address", "==", address));
 
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Search results:", results);
      return results;
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };
  const handleSearch = async (address) => {
    pdfFiles.length = 0;
    const results = await getNftIdFromDb(address);
    results.forEach(async (result) => {
      console.log(result.nft_id);
      const tokenId = await userService.getPdfHash(result.nft_id);
      const pdfUrl = ipfs_url + tokenId;
      console.log(pdfUrl)
      setPdfFiles((prevPdfFiles) => [...prevPdfFiles, pdfUrl]);
      console.log(pdfFiles)
    });
  };


  return (
    <Box>
      <StyledBox>
        <Typography variant="h1" component="h1" gutterBottom>
          Trouver des diagnostics en recherchant une adresse
        </Typography>
        <AddressSearchBox onSearch={handleSearch} />
      </StyledBox>
      <Container>
        <Grid container rowSpacing={1.5} columnSpacing={1.5}>
          {pdfFiles.map((pdfFile, index) => (
            <Grid key={index} item xs={3}>
              <Item>
                <PDFPreviewCard pdfFile={pdfFile} />
              </Item>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FindDiagnosticsPage;
