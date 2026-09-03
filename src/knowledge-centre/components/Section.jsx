import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/**
 * Section shell: uppercase label, interpretative headline, hairline, content.
 *
 * From md up the section is a two-column measure — a ~760px main column and a
 * ~320px sidebar — mirroring the printed brief. `aside` is optional; when it is
 * absent the main column keeps its width rather than stretching, so headlines
 * and running text hold the same measure across the whole edition. On phones
 * the two columns collapse and the aside follows the main content.
 */
export default function Section({ label, headline, scope, aside, fullWidth = false, children, sx }) {
  return (
    <Box
      component="section"
      sx={{
        display: "grid",
        alignItems: "start",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: fullWidth ? "minmax(0, 1fr)" : "minmax(0, 760fr) minmax(0, 340fr)",
        },
        columnGap: { md: 10 },
        rowGap: 4,
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {label ? (
          <Typography variant="overline" component="h2" sx={{ color: "thb.greyGreen", m: 0 }}>
            {label}
          </Typography>
        ) : null}
        {headline ? (
          <Typography
            variant="h2"
            component="p"
            sx={{ mt: 2, color: "thb.petroleum", maxWidth: READING_WIDTH }}
          >
            {headline}
          </Typography>
        ) : null}
        {headline ? <Box sx={{ mt: 3, height: "1px", backgroundColor: "thb.beige" }} /> : null}
        {scope ? (
          <Typography
            variant="body2"
            component="p"
            sx={{
              mt: 3,
              color: "thb.greyGreen",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {scope}
          </Typography>
        ) : null}
        <Box sx={{ mt: 3, display: "grid", gap: 4 }}>{children}</Box>
      </Box>

      {aside && !fullWidth ? <Box sx={{ minWidth: 0, mt: { md: 4.25 } }}>{aside}</Box> : null}
    </Box>
  );
}
