import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Game from "./components/Game";
import PlayerView from "./components/PlayerView";
import EntryModal from "./components/EntryModal";

// Create theme with Arabic font support
const theme = createTheme({
  typography: {
    fontFamily: '"Cairo", "Noto Sans Arabic", "Arial", sans-serif',
  },
  direction: "rtl",
  palette: {
    primary: {
      main: "#22C55E",
    },
    secondary: {
      main: "#F97316",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Entry Modal Route */}
          <Route path="/" element={<EntryModal />} />

          {/* Controller Route - for game host */}
          <Route path="/game/:gameId" element={<Game />} />

          {/* Player Route - for players */}
          <Route path="/play/:gameId" element={<PlayerView />} />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
