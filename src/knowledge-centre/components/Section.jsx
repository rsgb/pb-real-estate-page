import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/** Section shell: uppercase label, interpretative headline, content. */
export default function Section({ label, headline, scope, children, sx }) {
  return (
    <Box component="section" sx={{ ...sx }}>
      {label ? (
        <Typography variant="overline" component="h2" sx={{ color: "thb.greyGreen", m: 0 }}>
          {label}
        </Typography>
      ) : null}
      {headline ? (
        <Typography
          variant="h2"
          component="p"
          sx={{ mt: 1, color: "thb.petroleum", maxWidth: READING_WIDTH }}
        >
          {headline}
        </Typography>
      ) : null}
      {scope ? (
        <Typography variant="body2" component="p" sx={{ mt: 1, color: "thb.greyGreen" }}>
          {scope}
        </Typography>
      ) : null}
      <Box sx={{ mt: 3, display: "grid", gap: 3 }}>{children}</Box>
    </Box>
  );
}
