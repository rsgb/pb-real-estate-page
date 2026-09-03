import { Box } from "@mui/material";
import { THB_COLORS, THB_FONT_FAMILY } from "../theme";

/**
 * Lettered THB mark: a petroleum disc carrying "THB" in ivory, as it appears in
 * the bottom-right corner of the LinkedIn cards and of Paulo's signature.
 *
 * It replaces the "+" monogram wherever the mark sits next to an interactive
 * area: a circled plus reads as an "add" control, the letters do not.
 *
 * Drawn on a 100×100 viewBox so every measure is a percentage of `size`.
 * The letters are 25 units tall (cap height ≈ 0.727em, matching the cards),
 * the baseline sits at 59 so the caps are optically centred, and the anchor is
 * nudged half a letter-space right to cancel the trailing space that
 * letter-spacing adds after the final "B".
 */
export default function ThbMark({ size = 44, sx, ...props }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
      sx={{ width: size, height: size, flexShrink: 0, display: "block", ...sx }}
    >
      <circle cx="50" cy="50" r="50" fill={THB_COLORS.petroleum} />
      <text
        x="50.5"
        y="59"
        textAnchor="middle"
        fill={THB_COLORS.ivory}
        style={{
          fontFamily: THB_FONT_FAMILY,
          fontSize: "25px",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        THB
      </text>
    </Box>
  );
}
