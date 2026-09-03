import { Box } from "@mui/material";

/**
 * Short accent rule. Direção A replaces every outlined pill and left border
 * with this device: a 22×2 terracotta mark above the label it emphasises.
 * Purely decorative, so it is hidden from assistive technology.
 *
 * `component` exists for the one case where the rule sits inside a paragraph
 * (the edition header metadata line), where a <div> would be invalid markup.
 */
export default function Rule({
  width = 22,
  height = 2,
  color = "thb.terracotta",
  component = "div",
  sx,
}) {
  return (
    <Box
      component={component}
      aria-hidden="true"
      sx={{ width, height: `${height}px`, backgroundColor: color, flexShrink: 0, ...sx }}
    />
  );
}
