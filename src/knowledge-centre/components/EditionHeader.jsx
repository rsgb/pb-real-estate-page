import { Box, Typography } from "@mui/material";
import { formatDate, formatPeriod } from "../../lib/format";
import { pick, useThbLang } from "../lang";
import monogram from "../assets/thb-monogram.svg";
import { READING_WIDTH } from "../theme";

/**
 * Edition header (Componentes Visuais v0.9 s.4): series, country and period,
 * editorial horizon, language, publication date and data status.
 */
export default function EditionHeader({ edition, section, sx }) {
  const { contentLang, t } = useThbLang();
  if (!edition) return null;

  const horizon = t.horizons?.[edition.horizon] ?? edition.horizon;
  const status = t.dataStatus?.[edition.dataStatus] ?? edition.dataStatus;
  const strapline = pick(section?.strapline, contentLang);
  const author = section?.author;

  const meta = [
    { key: "language", label: t.language, value: contentLang.toUpperCase() },
    {
      key: "published",
      label: t.publishedOn,
      value: formatDate(edition.publishedAt, contentLang),
      dateTime: edition.publishedAt,
    },
    { key: "status", label: t.dataStatusLabel, value: status },
  ];

  return (
    <Box component="header" sx={{ ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="img"
          src={monogram}
          alt=""
          aria-hidden="true"
          sx={{ width: 32, height: 32, flexShrink: 0, display: "block" }}
        />
        <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
          {t.seriesName}
        </Typography>
      </Box>

      <Typography variant="h1" component="h1" sx={{ mt: 1, color: "thb.petroleum" }}>
        {t.country} | {formatPeriod(edition, contentLang)}
      </Typography>

      <Box sx={{ height: "3px", width: 64, backgroundColor: "thb.terracotta", mt: 2 }} />

      {strapline ? (
        <Typography
          variant="subtitle1"
          component="p"
          sx={{ mt: 2.5, color: "thb.greyGreen", maxWidth: READING_WIDTH }}
        >
          {strapline}
        </Typography>
      ) : null}

      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: { xs: 1.5, sm: 3 },
        }}
      >
        <Box
          component="span"
          sx={{
            border: "1px solid",
            borderColor: "thb.petroleum",
            color: "thb.petroleum",
            px: 1.25,
            py: 0.5,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {horizon}
        </Box>

        <Box component="dl" sx={{ m: 0, display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 3 } }}>
          {meta
            .filter((item) => item.value)
            .map((item) => (
              <Box key={item.key} sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                <Typography component="dt" variant="caption" sx={{ color: "thb.greyGreen" }}>
                  {item.label}
                </Typography>
                <Typography
                  component="dd"
                  variant="caption"
                  sx={{ m: 0, color: "thb.petroleum", fontWeight: 600 }}
                >
                  {item.dateTime ? (
                    <time dateTime={item.dateTime}>{item.value}</time>
                  ) : (
                    item.value
                  )}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>

      {author?.name ? (
        <Typography variant="body2" component="p" sx={{ mt: 2, color: "thb.greyGreen" }}>
          {author.name}
          {pick(author.role, contentLang) ? ` — ${pick(author.role, contentLang)}` : ""}
        </Typography>
      ) : null}
    </Box>
  );
}
