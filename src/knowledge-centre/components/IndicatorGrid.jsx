import { Box } from "@mui/material";
import IndicatorCard from "./IndicatorCard";

/** Three cards per row on desktop, two on tablet, one on mobile; equal heights. */
export default function IndicatorGrid({ indicators = [], sx }) {
  if (!indicators.length) return null;
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        alignItems: "stretch",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
        ...sx,
      }}
    >
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.key} indicator={indicator} />
      ))}
    </Box>
  );
}
