import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../../theme";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useEth from "../../../contexts/EthContext/useEth";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import Fingerprint from "@mui/icons-material/Fingerprint";
import Alert from "@mui/material/Alert";

const OwnerDashboard = () => {
  const {
    state: { userService },
  } = useEth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [diagnosticianAddress, setDiagnosticianAddress] = useState("");
  const [siret, setSiret] = useState("");
  const [foundDiagnostician, setFoundDiagnostician] = useState(null);

  const handleSearch = () => {
    const diagnostician = userService.getDiagnosticianBySiret(siret);
    diagnostician.then((result) => {    
      result[1].then((d) => {
        setFoundDiagnostician(d);
      })
      setDiagnosticianAddress(result[0]);
    });
  };

  const handleCertification = () => {
    const result = userService.certifyDiagnostician(diagnosticianAddress);
    console.log(result);
  };

  const handleInputChange = (event) => {
    setSiret(event.target.value);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Tableau de bord"
          subtitle="Bienvenue sur Diagnostify !"
        />
      </Box>
      {/* END HEADER */}

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            sx={{ m: 7 }}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Trouver un diagnostiqueur
            </Typography>
          </Box>
          <Paper
            elevation={3}
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
          >
            <IconButton sx={{ p: "10px" }} aria-label="menu">
              <MenuIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Entrez un numero SIRET ou une adresse Ethereum valide ici."
              value={siret}
              onChange={handleInputChange}
              inputProps={{ "aria-label": "Rechercher" }}
            />
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={handleSearch}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {/* Card */}
      {foundDiagnostician ? (
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Card sx={{ maxWidth: 345 }}>
            <CardHeader
              avatar={
                <Avatar
                  sx={{ bgcolor: colors.greenAccent[500] }}
                  aria-label="recipe"
                >
                  {foundDiagnostician.isCertified ? (
                    <CheckIcon />
                  ) : (
                    <CloseOutlinedIcon />
                  )}
                </Avatar>
              }
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
              title={"Raison Sociale : " + foundDiagnostician.name}
              subheader={"SIRET : " + siret}
            />
            {!foundDiagnostician.isCertified && (
              <CardActions disableSpacing>
                <Box>
                  <ButtonGroup
                    variant="contained"
                    aria-label="outlined primary button group"
                  >
                    <Button onClick={handleCertification}>
                      <Fingerprint />
                      Certifier
                    </Button>
                    <Button>
                      <CloseOutlinedIcon />
                      Rejeter
                    </Button>
                  </ButtonGroup>
                </Box>
              </CardActions>
            )}
          </Card>
        </Box>
      ) : (
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Alert variant="filled" severity="warning">
            Aucun Diagnostiqueur trouvé !
          </Alert>
          <Divider />
        </Box>
      )}
    </Box>
  );
};

export default OwnerDashboard;
