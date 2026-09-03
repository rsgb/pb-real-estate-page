import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/** Numbered signals to watch. Numbering is generated here, never stored. */
export default function Outlook({ intro, signals = [], sx }) {
  if (!signals.length) return null;
  return (
    <Box sx={{ maxWidth: READING_WIDTH, ...sx }}>
      {intro ? (
        <Typography variant="h2" component="p" sx={{ color: "thb.petroleum", mb: 3 }}>
          {intro}
        </Typography>
      ) : null}
      <Box component="ol" role="list" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 0 }}>
        {signals.map((signal, index) => (
          <Box
            key={index}
            component="li"
            role="listitem"
            sx={{
              display: "grid",
              gridTemplateColumns: "1.5rem 1fr",
              columnGap: 2.75,
              alignItems: "baseline",
              borderBottom: "1px solid",
              borderColor: "thb.beige",
              py: 2.5,
              "&:first-of-type": { borderTop: "1px solid", borderColor: "thb.beige" },
            }}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                lineHeight: 1.6,
                color: "thb.greyGreen",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {index + 1}.
            </Typography>
            <Typography variant="body1" component="span" sx={{ color: "thb.petroleum" }}>
              {signal}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
