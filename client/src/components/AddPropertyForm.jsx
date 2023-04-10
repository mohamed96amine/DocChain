import {
  Box,
  Button,
  TextField,
  Stack,
  Container,
  Autocomplete,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Formik } from "formik";
import * as yup from "yup";
import { styled } from "@mui/system";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "./Header";
import { useEth } from "../contexts/EthContext";
import React, { useState, useEffect } from "react";
import db from "../service/db/FireBase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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

const AddPropertyForm = () => {
  const {
    state: { myself, userService },
  } = useEth();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    descr: "",
    address: "",
  };

  const handleOk = () => {
    navigate("/");
  }

  const handleFormSubmit = async (values) => {
    const res = await userService.createProperty(
      values["name"],
      getRandomLetters(values["name"])
    );

    if (res.status == true) {
      console.log("ok");
      console.log(res.events.PropertyCreated.returnValues["property"]);
      setFormSubmitted(true);
      storeProperty(
        res.events.PropertyCreated.returnValues["property"],
        values["name"],
        values["descr"],
        values["address"]
      );
    }
  };

  const storeProperty = async (
    _contractAddress,
    _name,
    _description,
    _physicalAddress
  ) => {
    try {
      const docRef = await addDoc(collection(db, "properties"), {
        contractAddress: _contractAddress,
        name: _name,
        description: _description,
        physicalAddress: _physicalAddress,
      });
      console.log("Address and fileCID stored successfully");
    } catch (error) {
      console.error("Error storing address and fileCID:", error);
    }
  };

  const getAddressSuggestions = async (value) => {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${value}&type=housenumber&autocomplete=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.features.map((feature) => feature.properties.label);
  };

  useEffect(() => {}, [formSubmitted]);

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
        <Header title="Ajouter un bien" />
        {myself && (
          <div>
            {!formSubmitted ? (
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={checkoutSchema}
              >
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
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Donnez un nom à votre bien (Residence principale, secondaire...etc)"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.name}
                          name="name"
                          error={!!touched.name && !!errors.name}
                          helperText={touched.name && errors.name}
                          sx={{ gridColumn: "span 2", width: "400px" }}
                        />
                        <NeonTextField
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

                        <Autocomplete
                          freeSolo
                          disableClearable
                          options={addressSuggestions}
                          inputValue={values.address}
                          onInputChange={async (event, value) => {
                            const suggestions = await getAddressSuggestions(
                              value
                            );
                            setAddressSuggestions(suggestions);
                          }}
                          onChange={(event, value) => {
                            values.address = value;
                          }}
                          renderInput={(params) => (
                            <NeonTextField
                              {...params}
                              fullWidth
                              variant="filled"
                              type="text"
                              label="L'adresse de votre bien."
                              name="address"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              error={!!touched.address && !!errors.address}
                              helperText={touched.address && errors.address}
                              sx={{ gridColumn: "span 2", width: "400px" }}
                            />
                          )}
                        />

                        <Box display="flex" justifyContent="end" mt="20px">
                          <NeonButton
                            type="submit"
                            color="secondary"
                            variant="contained"
                          >
                            Ajouter un bien
                          </NeonButton>
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
                    Vous avez bien ajouté votre bien. Merci!
                  </Typography>
                  <Box display="flex" justifyContent="end" mt="20px">
                    <NeonButton
                      type="submit"
                      color="success"
                      variant="contained"
                      onClick={handleOk}
                    >
                      D'accord
                    </NeonButton>
                  </Box>
                </Box>
              </Box>
            )}
          </div>
        )}
      </Container>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  name: yup.string().required("Champ obligatoire"),
  descr: yup.string().required("Champ obligatoire"),
  address: yup.string().required("Champ obligatoire"),
});

function getRandomLetters(str) {
  let letters = str.split("");
  let randomLetters = [];

  for (let i = 0; i < 3; i++) {
    if (letters.length > 0) {
      let randomIndex = Math.floor(Math.random() * letters.length);
      randomLetters.push(letters[randomIndex]);
      letters.splice(randomIndex, 1);
    } else {
      randomLetters.push("");
    }
  }

  return randomLetters.join("");
}

export default AddPropertyForm;
