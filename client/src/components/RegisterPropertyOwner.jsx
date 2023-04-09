import React from "react";
import { Button, Container, Grid, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";

const RegisterPropertyOwner = ({ userService }) => {
  const history = useHistory();

  const handleRegister = async () => {
    try {
      await userService.registerPropertyOwner();
      history.push("/property-owner-dashboard");
    } catch (error) {
      console.error("Error registering property owner:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h4">Register as Property Owner</Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Register
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RegisterPropertyOwner;
