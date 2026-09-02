import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/**
 * Executive takeaway (Componentes Visuais v0.9 s.4): ivory panel, terracotta
 * vertical rule, recommended maximum of 45 words, legible without opening the PDF.
 */
export default function Takeaway({ label, text, component = "section", sx }) {
  if (!text) return null;
  return (
    <Box
      component={component}
      aria-label={label || undefined}
      sx={{
        backgroundColor: "thb.ivory",
        borderLeft: "4px solid",
        borderLeftColor: "thb.terracotta",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        maxWidth: READING_WIDTH,
        ...sx,
      }}
    >
      {label ? (
        <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen", mb: 1 }}>
          {label}
        </Typography>
      ) : null}
      <Typography
        component="p"
        sx={{
          fontSize: { xs: "1.0625rem", sm: "1.1875rem" },
          lineHeight: 1.5,
          fontWeight: 500,
          color: "thb.petroleum",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
