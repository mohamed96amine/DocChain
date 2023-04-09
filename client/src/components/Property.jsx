import {
  Box,
  Button,
  TextField,
  Stack,
  Container,
  Typography,
  Grid,
  Paper
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import { Formik } from "formik";
import { styled } from "@mui/system";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "./Header";
import { useEth } from "../contexts/EthContext";
import React, { useState, useEffect } from "react";
import db from "../service/db/FireBase";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import PDFPreviewCard from "./PDFPreviewCard";

const NeonTextField = styled(TextField)(({ theme }) => ({
  "& label.Mui-focused": {
    color: "cyan",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "cyan",
  },
  "& .MuiFilledInput-root": {
    background: "rgba(128, 128, 128, 0.7)",
    "&:hover": {
      background: "rgba(128, 128, 128, 0.8)",
    },
    "&.Mui-focused": {
      background: "rgba(128, 128, 128, 0.9)",
    },
  },
  "& .MuiFilledInput-input": {
    color: "white",
  },
  "& .MuiFormHelperText-root": {
    color: "red",
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #AD1EEB 30%, #d938a9 90%)",
  borderRadius: 3,
  border: 0,
  color: "white",
  height: 48,
  padding: "0 30px",
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));


const ipfs_url = "https://ipfs.io/ipfs/";

const Property = ({ contractAddress }) => {
  const {
    state: { myself, userService },
  } = useEth();
  const [pdfFiles, setPdfFiles] = useState([]);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openDiag, setOpenDiag] = useState(false);
  const [selectedDiagnostiqueur, setSelectedDiagnostiqueur] = useState("");
  const [diagnosticians, setDiagnosticians] = useState([]);
  const [initialValues, setInitialValues] = useState({
    name: "",
    descr: "",
    address: "",
  });

  const handleOpenDiag = async () => {
    setOpenDiag(true);
    getDiagnosticians();
  };

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
    console.log(address);
    results.forEach(async (result) => {
      console.log(result.nft_id);
      const tokenId = await userService.getDiagnosticHash(contractAddress, result.nft_id);
      const pdfUrl = ipfs_url + tokenId;
      console.log(pdfUrl);
      setPdfFiles((prevPdfFiles) => [...prevPdfFiles, pdfUrl]);
      console.log(pdfFiles)
    });
  };

  const getDiagnosticians = async () => {
    const diags = await findDiagnosticians();
    console.log(diags);
    const promises = diags.map((item) => {
      return {
        address: item.address,
        diagnostician: userService.getDiagnostician(item.address),
      };
    });

    Promise.all(promises.map((item) => item.diagnostician)).then((values) => {
      const resultArray = promises.map((item, index) => ({
        address: item.address,
        diagnostician: values[index],
      }));
      setDiagnosticians(resultArray);
      console.log(resultArray); // output: [{ address: '0x5cf5808A6e21D08B735A9166EF1Ff7E22D7fDd76', diagnostician: 'result of diagnostician Promise' }]
    });
  };

  const findDiagnosticians = async () => {
    const propertiesRef = collection(db, "diagnosticians");
    const q = query(propertiesRef);
    const querySnapshot = await getDocs(q);
    const matchingProperties = [];
    querySnapshot.forEach((doc) => {
      matchingProperties.push({ id: doc.id, ...doc.data() });
    });
    return matchingProperties;
  };
  const handleCloseDiag = () => {
    setOpenDiag(false);
  };
  const handleSelectDiagnostiqueur = (event) => {
    setSelectedDiagnostiqueur(event.target.value);
  };

  const handleRequestDiagnostic = async () => {
    console.log(selectedDiagnostiqueur);
    console.log(contractAddress);
    const res = await userService.requestDiagnostic(
      contractAddress,
      selectedDiagnostiqueur
    );
    console.log(res);
    if (res.status === true) {
      console.log("ok");
    }
    // Close the Dialog
    handleCloseDiag();
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
  useEffect(() => {
    findPropertiesByContractAddress(contractAddress).then((item) => {  
      if (item[0] !== undefined) {
        const name = item[0].name;
        const descr = item[0].description;
        const address = item[0].physicalAddress;
        setInitialValues({ name, descr, address });
      }
    });
  }, [contractAddress]);

  

  useEffect(() => {
    handleSearch(initialValues.address);
  }, [initialValues]);



  return (
    <Box m="20px">
      <Container
        sx={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "100%",
        }}
      >
        <Header title="Gestion de mon bien" />
        {myself && (
          <div>
            {!formSubmitted && initialValues.name ? (
              <Formik initialValues={initialValues}>
                {({
                  values,
                  errors,
                  touched,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <Box
                      display="grid"
                      gap="30px"
                      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      sx={{
                        "& > div": {
                          gridColumn: isNonMobile ? undefined : "span 4",
                        },
                      }}
                    >
                      <Stack>
                        <NeonTextField
                          disabled
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Le nom de votre bien."
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.name}
                          name="name"
                          error={!!touched.name && !!errors.name}
                          helperText={touched.name && errors.name}
                          sx={{ gridColumn: "span 2", width: "400px" }}
                        />
                        <NeonTextField
                          disabled
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Description de votre bien."
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.descr}
                          name="descr"
                          error={!!touched.descr && !!errors.descr}
                          helperText={touched.descr && errors.descr}
                          sx={{ gridColumn: "span 2", width: "400px" }}
                        />

                        <NeonTextField
                          disabled
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Adresse du bien."
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.address}
                          name="address"
                          error={!!touched.descr && !!errors.descr}
                          helperText={touched.descr && errors.descr}
                          sx={{ gridColumn: "span 2", width: "400px" }}
                        />

                        <Box display="flex" justifyContent="end" mt="20px">
                          <Stack spacing={2}>
                            <NeonButton
                              type="submit"
                              color="secondary"
                              variant="contained"
                              onClick={handleOpenDiag}
                            >
                              Demander le diagnostic
                            </NeonButton>
                            <NeonButton
                              type="submit"
                              color="secondary"
                              variant="contained"
                            >
                              Transfer la propriété
                            </NeonButton>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </form>
                )}
              </Formik>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={4}
              >
                <CheckIcon sx={{ fontSize: 60, color: "green" }} />
                <Box mt={2}>
                  <Typography variant="h5">
                    Vous avez demandé un diagnostic pour votre bien. Merci!
                  </Typography>
                </Box>
              </Box>
            )}
          </div>
        )}

        <Dialog open={openDiag} onClose={handleCloseDiag}>
          <DialogTitle>Choisissez le diagnostiqueur</DialogTitle>
          <DialogContent>
            <Select
              value={selectedDiagnostiqueur}
              onChange={handleSelectDiagnostiqueur}
            >
              {diagnosticians.map((item) => (
                <MenuItem key={item.address} value={item.address}>
                  {item.diagnostician.name}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDiag}>Annuler</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRequestDiagnostic}
            >
              Valider
            </Button>
          </DialogActions>
        </Dialog>
        
        {pdfFiles.map((pdfFile, index) => (
          <Grid key={index} item xs={3}>
            <Item>
              <PDFPreviewCard pdfFile={pdfFile} />
            </Item>
          </Grid>
        ))}
      </Container>
    </Box>
  );
};

export default Property;
