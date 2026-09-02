import { useId, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { formatNumber, unitLabel } from "../../lib/format";
import DataTable from "./DataTable";
import { pick, useThbLang } from "../lang";

/**
 * Horizontal bar list for regions and source markets (Sistema Visual v1.0 s.10).
 *
 * Pure HTML/CSS, no chart library. Values are signed, so the bars diverge from
 * a visible zero line: direction is read from the side of the line *and* from
 * the printed sign, never from colour. One accent colour only - petroleum for
 * the series, terracotta for the single highlighted item. Unit, period and
 * source are always visible, and the underlying numbers are one click away in
 * a real table.
 */
export default function BarList({ barList, sx }) {
  const { contentLang, t } = useThbLang();
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();

  if (!barList?.items?.length) return null;

  const { unit, scale = "none", decimals = 1, highlightKey } = barList;
  const title = pick(barList.title, contentLang);
  const period = pick(barList.period, contentLang);
  const source = pick(barList.source, contentLang);
  const altText = pick(barList.altText, contentLang);
  const unitToken = unitLabel({ unit, scale }, contentLang);

  const max = Math.max(...barList.items.map((item) => Math.abs(item.value)), 0) || 1;
  const hasNegative = barList.items.some((item) => item.value < 0);

  const columns = [
    { key: "label", label: t.tableItemHeader, align: "left" },
    { key: "value", label: t.tableValueHeader, unit, scale, decimals, align: "right", signed: true },
  ];
  const rows = barList.items.map((item, index) => ({
    key: item.key ?? index,
    label: pick(item.label, contentLang),
    value: item.value,
  }));

  return (
    <Box component="figure" sx={{ m: 0, ...sx }}>
      <Typography variant="h3" component="h3" sx={{ color: "thb.petroleum" }}>
        {title}
      </Typography>
      <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen", mt: 0.5 }}>
        {[unitToken, period].filter(Boolean).join(" · ")}
      </Typography>

      <Box
        role="img"
        aria-label={altText}
        sx={{ mt: 2.5, display: "grid", gap: 1.5, backgroundColor: "thb.white", p: { xs: 2, sm: 2.5 }, border: "1px solid", borderColor: "thb.beige" }}
      >
        {barList.items.map((item, index) => {
          const isHighlight = highlightKey && item.key === highlightKey;
          const width = `${(Math.abs(item.value) / max) * (hasNegative ? 50 : 100)}%`;
          const color = isHighlight ? "thb.terracotta" : "thb.petroleum";
          return (
            <Box
              key={item.key ?? index}
              sx={{
                display: "grid",
                alignItems: "center",
                columnGap: 2,
                rowGap: 0.5,
                gridTemplateColumns: { xs: "1fr auto", md: "minmax(6rem, 10rem) 1fr 5.5rem" },
                gridTemplateAreas: {
                  xs: '"label value" "bar bar"',
                  md: '"label bar value"',
                },
              }}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{ gridArea: "label", color: "thb.petroleum", fontWeight: isHighlight ? 600 : 400 }}
              >
                {pick(item.label, contentLang)}
              </Typography>

              <Box
                sx={{
                  gridArea: "bar",
                  position: "relative",
                  height: 14,
                  borderLeft: hasNegative ? "none" : "1px solid",
                  borderColor: "thb.beige",
                }}
              >
                {hasNegative ? (
                  <Box
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: -2,
                      bottom: -2,
                      width: "1px",
                      backgroundColor: "thb.beige",
                    }}
                  />
                ) : null}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    backgroundColor: color,
                    width,
                    ...(hasNegative
                      ? item.value < 0
                        ? { right: "50%" }
                        : { left: "50%" }
                      : { left: 0 }),
                  }}
                />
              </Box>

              <Typography
                component="span"
                variant="body2"
                sx={{
                  gridArea: "value",
                  textAlign: "right",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: "thb.petroleum",
                }}
              >
                {formatNumber(item.value, { unit, scale, decimals, signed: true }, contentLang)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography
        component="figcaption"
        variant="caption"
        sx={{ display: "block", mt: 1, color: "thb.greyGreen" }}
      >
        {t.source}: {source}
      </Typography>

      <Button
        type="button"
        size="small"
        variant="text"
        onClick={() => setShowTable((open) => !open)}
        aria-expanded={showTable}
        aria-controls={tableId}
        sx={{
          mt: 1,
          px: 0,
          color: "thb.petroleum",
          textDecoration: "underline",
          textUnderlineOffset: "0.2em",
          "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
        }}
      >
        {showTable ? t.hideDataTable : t.showDataTable}
      </Button>

      <Box id={tableId} hidden={!showTable}>
        {showTable ? (
          <DataTable
            caption={title}
            columns={columns}
            rows={rows}
            contentLang={contentLang}
            ariaLabel={`${title} — ${t.scrollTableHint}`}
            sx={{ mt: 1 }}
          />
        ) : null}
      </Box>
    </Box>
  );
}
