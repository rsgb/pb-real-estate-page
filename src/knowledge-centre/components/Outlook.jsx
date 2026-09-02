import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/** Numbered signals to watch. Numbering is generated here, never stored. */
export default function Outlook({ intro, signals = [], sx }) {
  if (!signals.length) return null;
  return (
    <Box sx={{ maxWidth: READING_WIDTH, ...sx }}>
      {intro ? (
        <Typography variant="h3" component="p" sx={{ color: "thb.petroleum", mb: 2.5 }}>
          {intro}
        </Typography>
      ) : null}
      <Box component="ol" role="list" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 2 }}>
        {signals.map((signal, index) => (
          <Box
            key={index}
            component="li"
            role="listitem"
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: 2,
              alignItems: "baseline",
              borderTop: "1px solid",
              borderColor: "thb.beige",
              pt: 2,
            }}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: "1.5rem",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "thb.terracotta",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(index + 1).padStart(2, "0")}
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
