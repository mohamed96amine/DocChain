import { EthProvider } from "./contexts/EthContext";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/TopBar";
import Dashboard from "./scenes/dashboard";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import UserDashboard from "./scenes/dashboard/user";
import UncertifiedDiagnosticianDashboard from "./scenes/dashboard/UncertifiedDiagnostician"
import NeonSearchBox from "./scenes/Search";
import UnregisteredPropertyOwner from "./scenes/dashboard/UnregisteredPropertyOwner";

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <EthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            <main className="content">
              <Topbar />
              <Routes>
                <Route path="/" element={<NeonSearchBox />} />
                <Route path="/me" element={<Dashboard />} />
                <Route
                  path="/request-verification"
                  element={<UncertifiedDiagnosticianDashboard />}
                />

                <Route
                  path="/register-property-owner"
                  element={<UnregisteredPropertyOwner />}
                />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </EthProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
