import { Box, Typography } from "@mui/material";
import { formatNumber, unitLabel } from "../../lib/format";
import { pick } from "../lang";

/**
 * Accessible table (Sistema Visual v1.0 s.11).
 * Units live in the header, numbers are right aligned, precision is uniform,
 * and on narrow screens the table scrolls inside a focusable, labelled region.
 */

export default function DataTable({
  caption,
  columns = [],
  rows = [],
  source,
  contentLang = "en",
  ariaLabel,
  captionVisible = true,
  sx,
}) {
  if (!columns.length) return null;
  const label = ariaLabel ?? caption ?? "";

  return (
    <Box sx={{ mt: 2, ...sx }}>
      <Box
        role="region"
        tabIndex={0}
        aria-label={label}
        sx={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          border: "1px solid",
          borderColor: "thb.beige",
          backgroundColor: "thb.white",
          "&:focus-visible": { outline: "2px solid", outlineColor: "thb.petroleum", outlineOffset: 2 },
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            minWidth: { xs: `${Math.max(columns.length * 8, 24)}rem`, md: 0 },
            borderCollapse: "collapse",
            fontSize: "0.9375rem",
            "& caption": {
              captionSide: "top",
              textAlign: "left",
              px: 2,
              py: 1.5,
              fontWeight: 600,
              color: "thb.petroleum",
              ...(captionVisible
                ? {}
                : {
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                  }),
            },
            "& th, & td": {
              px: 2,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "thb.beige",
              verticalAlign: "top",
            },
            "& thead th": {
              backgroundColor: "thb.ivory",
              color: "thb.petroleum",
              fontWeight: 600,
              whiteSpace: "nowrap",
            },
            "& tbody tr:last-of-type th, & tbody tr:last-of-type td": { borderBottom: "none" },
          }}
        >
          {caption ? <caption>{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((column) => {
                const unit = unitLabel(column, contentLang);
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={{ textAlign: column.align ?? "left" }}
                  >
                    {pick(column.label, contentLang)}
                    {unit ? ` (${unit})` : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key ?? index}>
                {columns.map((column, columnIndex) => {
                  const raw = row[column.key];
                  const isNumber = typeof raw === "number";
                  const content =
                    raw === null || raw === undefined
                      ? "—"
                      : isNumber
                        ? formatNumber(
                            raw,
                            {
                              unit: column.unit,
                              scale: column.scale,
                              decimals: column.decimals ?? 1,
                              signed: Boolean(column.signed),
                            },
                            contentLang
                          )
                        : pick(raw, contentLang);
                  const align = column.align ?? (isNumber ? "right" : "left");
                  return columnIndex === 0 ? (
                    <th key={column.key} scope="row" style={{ textAlign: align, fontWeight: 500 }}>
                      {content}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      style={{ textAlign: align, fontVariantNumeric: "tabular-nums" }}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
      {source ? (
        <Typography variant="caption" component="p" sx={{ mt: 1, color: "thb.greyGreen" }}>
          {source}
        </Typography>
      ) : null}
    </Box>
  );
}
