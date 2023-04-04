import { EthProvider } from "./contexts/EthContext";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import UserDashboard from "./scenes/dashboard/user";
import NeonSearchBox from "./scenes/Search";

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
                <Route path="/" element={<Dashboard />} />
                <Route path="/request-verification" element={<UserDashboard />} />
                <Route path="/explore" element={<NeonSearchBox />} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </EthProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
