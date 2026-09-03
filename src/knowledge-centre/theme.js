import { createTheme } from "@mui/material/styles";

/**
 * Tourism & Hospitality Brief theme (Sistema Visual v1.0 s.3, s.4, s.13).
 *
 * Accessibility note: terracotta (#C97849) is 2.95:1 on ivory and therefore
 * fails WCAG AA for body text. It is reserved for rules, accents and headings
 * at 24px or larger; it is never used for small labels or running text.
 * Positive/negative are functional chart colours, distinct from the brand
 * palette, and are always shown alongside an explicit sign.
 */

export const THB_COLORS = {
  petroleum: "#163E3D",
  ivory: "#F4F0E7",
  terracotta: "#C97849",
  greyGreen: "#5E6864",
  beige: "#C9C2B5",
  white: "#FFFFFF",
  positive: "#1B7F5C",
  negative: "#B3261E",
};

export const THB_FONT_FAMILY = "Inter, Helvetica Neue, Arial, sans-serif";

/**
 * Headings are set in the site's editorial serif (Direção A «Clássico
 * renovado»); everything else stays Inter, which carries the numbers.
 */
export const THB_SERIF_FAMILY = "'Libre Baskerville', 'Times New Roman', Georgia, serif";

/** Comfortable measure for running text (Componentes Visuais v0.9 s.5). */
export const READING_WIDTH = "72ch";

const { breakpoints } = createTheme();

export const thbTheme = createTheme({
  palette: {
    mode: "light",
    thb: { ...THB_COLORS },
    primary: { main: THB_COLORS.petroleum, contrastText: THB_COLORS.white },
    secondary: { main: THB_COLORS.terracotta, contrastText: THB_COLORS.petroleum },
    success: { main: THB_COLORS.positive },
    error: { main: THB_COLORS.negative },
    background: { default: THB_COLORS.ivory, paper: THB_COLORS.white },
    text: { primary: THB_COLORS.petroleum, secondary: THB_COLORS.greyGreen },
    divider: THB_COLORS.beige,
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: THB_FONT_FAMILY,
    h1: {
      fontFamily: THB_SERIF_FAMILY,
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.15,
      color: THB_COLORS.petroleum,
      [breakpoints.down("sm")]: { fontSize: "1.875rem" },
    },
    h2: {
      fontFamily: THB_SERIF_FAMILY,
      fontSize: "1.625rem",
      fontWeight: 700,
      lineHeight: 1.25,
      color: THB_COLORS.petroleum,
    },
    h3: {
      fontFamily: THB_SERIF_FAMILY,
      fontSize: "1.25rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: THB_COLORS.petroleum,
    },
    h4: { fontFamily: THB_FONT_FAMILY, fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.55 },
    caption: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.45 },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
    button: { fontWeight: 600, letterSpacing: "0.02em", textTransform: "none" },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiLink: {
      defaultProps: { underline: "always" },
      styleOverrides: { root: { textUnderlineOffset: "0.2em" } },
    },
  },
});

export default thbTheme;
