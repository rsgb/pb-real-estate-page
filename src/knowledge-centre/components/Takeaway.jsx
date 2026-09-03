import { Box, Typography } from "@mui/material";
import Rule from "./Rule";
import { READING_WIDTH } from "../theme";

/**
 * Executive takeaway (Componentes Visuais v0.9 s.4): white panel inside a beige
 * hairline, a short terracotta rule above the label, recommended maximum of 45
 * words, legible without opening the PDF.
 */
export default function Takeaway({ label, text, component = "section", sx }) {
  if (!text) return null;
  return (
    <Box
      component={component}
      aria-label={label || undefined}
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        maxWidth: READING_WIDTH,
        ...sx,
      }}
    >
      <Rule />
      {label ? (
        <>
          <Typography
            variant="overline"
            component="p"
            sx={{ mt: 1.75, fontSize: "0.65625rem", color: "thb.petroleum" }}
          >
            {label}
          </Typography>
          <Rule width={32} height={1} color="thb.beige" sx={{ my: 1.75 }} />
        </>
      ) : null}
      <Typography
        component="p"
        sx={{
          mt: label ? 0 : 1.75,
          fontSize: "0.9375rem",
          lineHeight: 1.7,
          color: "thb.petroleum",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
