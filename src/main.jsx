import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from "@mui/material";
import App from "./App.jsx";
import "./formio-overrides.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f6fff"
    },
    secondary: {
      main: "#15b67a"
    },
    background: {
      default: "#f5f8ff",
      paper: "#ffffff"
    },
    text: {
      primary: "#0f172a",
      secondary: "#60708d"
    },
    json: {
      key: "#8ab4ff",
      string: "#79e2af",
      number: "#ffb86c",
      boolean: "#ff8a80"
    }
  },
  shape: {
    borderRadius: 20
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h5: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700
    },
    h6: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700
    },
    button: {
      textTransform: "none"
    },
    mono: {
      fontFamily: '"IBM Plex Mono", "SFMono-Regular", monospace'
    },
    heading: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif'
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            fontSynthesis: "none",
            textRendering: "optimizeLegibility",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale"
          },
          body: {
            margin: 0
          },
          "*::-webkit-scrollbar": {
            width: 10,
            height: 10
          },
          "*::-webkit-scrollbar-thumb": {
            background: "rgba(95, 117, 171, 0.34)",
            borderRadius: 999
          },
          "*::-webkit-scrollbar-track": {
            background: "transparent"
          }
        }}
      />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
