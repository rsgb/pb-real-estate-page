import { Box } from "@mui/material";

/**
 * Short accent rule. Direção A replaces every outlined pill and left border
 * with this device: a 22×2 terracotta mark above the label it emphasises.
 * Purely decorative, so it is hidden from assistive technology.
 */
export default function Rule({ width = 22, height = 2, color = "thb.terracotta", sx }) {
  return (
    <Box
      aria-hidden="true"
      sx={{ width, height: `${height}px`, backgroundColor: color, flexShrink: 0, ...sx }}
    />
  );
}
