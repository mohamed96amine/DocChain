import { Box, Button, TextField, Container, Typography } from "@mui/material";

import { styled } from "@mui/system";
import Header from "../../../components/Header";
import useEth from "../../../contexts/EthContext/useEth";
import React, { useState, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";

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

const UnregisteredPropertyOwner = () => {
  const {
    state: { myself, userService },
  } = useEth();
  const [isRegistered, setIsRegistered] = useState(false);


  const registerOwner = async () => {
    const event = await userService.registerOwner();
    if (event.status == true) {
      console.log("ok");
      setIsRegistered(true);
    }
  };

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
        <Header
          title="Demande de vérification"
          subtitle="Demander une vérification pour pouvoir réaliser des diagnostics."
        />
        {myself?.isPropertyOwner === false && !isRegistered && (
          <Box display="flex" justifyContent="end" mt="20px">
            <NeonButton
              onClick={registerOwner}
              color="secondary"
              variant="contained"
            >
              S'inscrire
            </NeonButton>
          </Box>
        )}
        {(isRegistered || myself?.isPropertyOwner === true) && (
          <Box display="flex" alignItems="center" mt="20px">
            <CheckIcon sx={{ fontSize: 30, color: "green" }} />
            <Box ml={2}>
              <Typography variant="h5">
                Vous êtes bien enregistré en tant que propriétaire.
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default UnregisteredPropertyOwner;
