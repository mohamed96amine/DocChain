import { Button, Box, Typography, Stack, Divider } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";


const NeonTitle = styled(Typography)(({ theme }) => ({
  color: "#08F7FE",
  fontWeight: "bold",
}));

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

const Slogan = styled(Typography)(({ theme }) => ({
  color: "#ffffff",
  fontWeight: "300",
  fontSize: "22px",
  fontStyle: "italic",
  marginTop: "20px",
}));

const Home = () => {
  const navigate = useNavigate();

  const onClickGoToVerification = () => {
    navigate("/request-verification");
  };

  const onClickGoToPropertyOwner = () => {
    navigate("/register-property-owner");
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
        Diagnostics sécurisés et transparents grâce à la blockchain.
      </Slogan>
      <Box sx={{ marginTop: "70px", marginBottom: "10px" }}>
        <NeonButton onClick={onClickGoToVerification}>
          Je suis diagnostiqueur
        </NeonButton>
        <NeonButton onClick={onClickGoToPropertyOwner}>
          Je suis propriétaire
        </NeonButton>
      </Box>
    </Box>
  );
};

export default Home;
