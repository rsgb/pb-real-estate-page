import { Box, Typography } from "@mui/material";
import Rule from "./Rule";
import { READING_WIDTH } from "../theme";

/**
 * Attention signal / main conclusion box. Both kinds share the same white panel
 * inside a beige hairline and carry the terracotta rule above the label, so the
 * device reads the same wherever it appears — main column or sidebar.
 */
export default function Callout({ kind = "conclusion", title, body, sx }) {
  if (!body && !title) return null;
  return (
    <Box
      component="aside"
      data-kind={kind}
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        px: { xs: 2, sm: 3.5 },
        py: { xs: 2, sm: 3 },
        maxWidth: READING_WIDTH,
        ...sx,
      }}
    >
      <Rule />
      {title ? (
        <>
          <Typography
            variant="overline"
            component="p"
            sx={{ mt: 1.75, fontSize: "0.65625rem", color: "thb.petroleum" }}
          >
            {title}
          </Typography>
          <Rule width={32} height={1} color="thb.beige" sx={{ my: 1.75 }} />
        </>
      ) : null}
      {body ? (
        <Typography
          component="p"
          sx={{
            mt: title ? 0 : 1.75,
            fontSize: "0.96875rem",
            lineHeight: 1.7,
            color: "thb.petroleum",
          }}
        >
          {body}
        </Typography>
      ) : null}
    </Box>
  );
}
