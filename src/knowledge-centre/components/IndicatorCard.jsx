import { Box, Typography } from "@mui/material";
import { formatChange, formatValue } from "../../lib/format";
import { pick, useThbLang } from "../lang";

/**
 * One indicator card (Componentes Visuais v0.9 s.4).
 * Colour is never the only cue for the direction of a change: the sign is
 * always printed, the comparison basis is spelled out, and the arrow is a
 * decorative addition rather than the carrier of meaning (Sistema Visual v1.0 s.13).
 */
export default function IndicatorCard({ indicator }) {
  const { contentLang, t } = useThbLang();
  if (!indicator) return null;

  const label = pick(indicator.label, contentLang);
  const value = formatValue(indicator, contentLang);
  const change = formatChange(indicator.change, contentLang);
  const note = pick(indicator.note, contentLang);
  const status = indicator.status ? t.dataStatus[indicator.status] : null;

  const direction =
    change?.direction ??
    (indicator.valueBasis && indicator.valueBasis !== "level" ? Math.sign(indicator.value) : 0);
  const directionColor =
    direction > 0 ? "thb.positive" : direction < 0 ? "thb.negative" : "thb.greyGreen";
  const arrow = direction > 0 ? "▲" : direction < 0 ? "▼" : "";

  const summary = [label, value, change?.text, note, status].filter(Boolean).join(". ");

  return (
    <Box
      component="article"
      aria-label={summary}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          lineHeight: 1.35,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "thb.greyGreen",
        }}
      >
        {label}
      </Typography>

      <Typography
        component="p"
        sx={{
          fontSize: { xs: "1.75rem", sm: "2rem" },
          fontWeight: 700,
          lineHeight: 1.1,
          color: "thb.petroleum",
          fontVariantNumeric: "tabular-nums",
          ...(indicator.valueBasis && indicator.valueBasis !== "level" && direction !== 0
            ? { color: directionColor }
            : {}),
        }}
      >
        {value}
      </Typography>

      {change ? (
        <Typography
          component="p"
          variant="body2"
          sx={{ display: "flex", alignItems: "baseline", gap: 0.75, color: directionColor }}
        >
          {arrow ? (
            <Box component="span" aria-hidden="true" sx={{ fontSize: "0.7rem" }}>
              {arrow}
            </Box>
          ) : null}
          <Box component="span" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {change.value}
          </Box>
          {change.basis ? (
            <Box component="span" sx={{ color: "thb.greyGreen", fontWeight: 400 }}>
              {change.basis}
            </Box>
          ) : null}
        </Typography>
      ) : null}

      <Box sx={{ mt: "auto" }}>
        {note ? (
          <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
            {note}
          </Typography>
        ) : null}
        {status ? (
          <Typography
            component="p"
            sx={{
              mt: 1,
              display: "inline-block",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "thb.greyGreen",
              border: "1px solid",
              borderColor: "thb.beige",
              px: 0.75,
              py: 0.25,
            }}
          >
            {status}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
