import {
  Box,
  Button,
  IconButton,
  Typography,
  Item,
  useTheme,
} from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import HorizontalDividedComponent from "../../../components/HorizontalDividedComponent ";

const CertifiedDiagnosticianDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Tableau de bord"
          subtitle="Bienvenue sur Diagnostify !"
        />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="300px"
        gap="20px"
      >
        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <HorizontalDividedComponent />
        </Box>
      </Box>
    </Box>
  );
};

export default CertifiedDiagnosticianDashboard;
