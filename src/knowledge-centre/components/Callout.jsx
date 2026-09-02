import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/**
 * Attention signal / main conclusion box.
 * `conclusion` sits on ivory, `attention` on white inside a beige frame; both
 * carry the terracotta rule so the two kinds are distinguishable without colour.
 */
export default function Callout({ kind = "conclusion", title, body, sx }) {
  if (!body && !title) return null;
  const isConclusion = kind === "conclusion";
  return (
    <Box
      component="aside"
      sx={{
        backgroundColor: isConclusion ? "thb.ivory" : "thb.white",
        border: isConclusion ? "none" : "1px solid",
        borderColor: "thb.beige",
        borderLeft: "4px solid",
        borderLeftColor: "thb.terracotta",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        maxWidth: READING_WIDTH,
        ...sx,
      }}
    >
      {title ? (
        <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen", mb: 1 }}>
          {title}
        </Typography>
      ) : null}
      {body ? (
        <Typography component="p" variant="body1" sx={{ color: "thb.petroleum" }}>
          {body}
        </Typography>
      ) : null}
    </Box>
  );
}
