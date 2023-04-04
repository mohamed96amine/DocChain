import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";

const NeonButton = styled(Button)(({ theme }) => ({
  border: "2px solid #6C63FF",
  borderRadius: "5px",
  color: "#6C63FF",
  fontWeight: "bold",
  padding: "10px 30px",
  fontSize: "18px",
  textTransform: "none",
  "&:hover": {
    background: "#6C63FF",
    color: "#ffffff",
  },
  "&:nth-of-type(2)": {
    marginLeft: "20px",
  },
}));

const NeonTitle = styled(Typography)(({ theme }) => ({
  color: "#08F7FE",
  fontWeight: "bold",
}));

const Slogan = styled(Typography)(({ theme }) => ({
  color: "#ffffff",
  fontWeight: "300",
  fontSize: "22px",
  fontStyle: "italic",
  marginTop: "20px",
}));

const LandingPage = () => {
  const navigate = useNavigate();

  const onClickGoToVerification = () => {
    navigate("/request-verification");
  };

  const onClickGoToExplore = () => {
    navigate("/explore");
  };
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: (theme) => theme.palette.background.default,
      }}
    >
      <NeonTitle variant="h2" gutterBottom>
        Diagnostify
      </NeonTitle>
      <Slogan variant="subtitle1">
        Diagnostics sécurisés et transparents grâce à la blockchain
      </Slogan>
      <Box sx={{ marginTop: "40px" }}>
        <NeonButton onClick={onClickGoToVerification}>
          Je suis diagnostiqueur et je souhaite m'inscrire
        </NeonButton>
        <NeonButton onClick={onClickGoToExplore}>
          Je souhaite explorer les diagnostics
        </NeonButton>
      </Box>
    </Box>
  );
};

export default LandingPage;
