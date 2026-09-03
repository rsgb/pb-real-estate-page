import { createTheme } from "@mui/material/styles";

/**
 * Site theme — Direction A «Clássico renovado».
 *
 * Identity tokens live in `palette.custom`; components read them from there
 * instead of hard-coding hex values. Type is Libre Baskerville 700 for
 * headings and Montserrat for body/UI (both self-hosted, see entry-client).
 * Square corners, no elevation: depth comes from hairlines, not shadows.
 */
const SANS = [
  "Montserrat",
  "Helvetica Neue",
  "Helvetica",
  "Arial",
  "sans-serif",
].join(", ");

const SERIF = ["'Libre Baskerville'", "'Times New Roman'", "Georgia", "serif"].join(
  ", "
);

const theme = createTheme({
  palette: {
    primary: { main: "#121a26" }, // deep navy
    text: { primary: "#0e1116" }, // near-black
    background: {
      default: "#f8f6f2", // warm white (page background)
      paper: "#fbfaf7", // card/surface
    },
    // Keep default divider neutral; add custom tokens for hairlines
    divider: "rgba(12, 14, 18, 0.08)",
    custom: {
      navy: "#121a26",
      warmWhite: "#f8f6f2",
      champagne: "#c8b27a",
      burgundy: "#6e2b33",
      champagneHairline: "rgba(200, 178, 122, 0.35)",
      champagneFrame: "rgba(200, 178, 122, 0.75)",
      hairline: "rgba(12, 14, 18, 0.08)",
      logoHairline: "rgba(12, 14, 18, 0.06)",
      footerBg: "#0e1116", // rich near-black for footer (less blue)
      aboutBand: "#f3f0ea",
      bodyText: "#333a44",
      textMuted: "#4a4f57",
      onNavyMuted: "#d9d4c7",
    },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: SANS,
    h1: { fontFamily: SERIF, fontWeight: 700 },
    h2: { fontFamily: SERIF, fontWeight: 700 },
    h3: { fontFamily: SERIF, fontWeight: 700 },
    h4: { fontFamily: SERIF, fontWeight: 700 },
    button: { textTransform: "none" },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "#fbfaf7",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

export default theme;
