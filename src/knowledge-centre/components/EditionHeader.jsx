import { Box, Typography } from "@mui/material";
import { formatDate, formatPeriod } from "../../lib/format";
import { pick, useThbLang } from "../lang";
import monogram from "../assets/thb-monogram.svg";
import { READING_WIDTH } from "../theme";

/**
 * Edition header (Componentes Visuais v0.9 s.4): series, country and period,
 * editorial horizon, language, publication date and data status.
 *
 * The nameplate is two deliberate lines — series, then country and period —
 * each held on one line from md up, as a masthead would be set. The metadata
 * that used to sit in chips and label/value pairs now runs as one plain line
 * under the terracotta rule.
 */
export default function EditionHeader({ edition, section, sx }) {
  const { contentLang, t } = useThbLang();
  if (!edition) return null;

  const horizon = t.horizons?.[edition.horizon] ?? edition.horizon;
  const status = t.dataStatus?.[edition.dataStatus] ?? edition.dataStatus;
  const kicker = pick(section?.kicker, contentLang);
  const strapline = pick(section?.strapline, contentLang);
  const author = section?.author;
  const authorRole = pick(author?.role, contentLang);

  const meta = [
    { key: "horizon", value: horizon },
    {
      key: "published",
      value: (
        <>
          {t.publishedOn}{" "}
          <time dateTime={edition.publishedAt}>
            {formatDate(edition.publishedAt, contentLang)}
          </time>
        </>
      ),
    },
    { key: "status", value: status },
    {
      key: "author",
      value: author?.name ? [author.name, authorRole].filter(Boolean).join(", ") : "",
    },
  ].filter((item) => item.value);

  return (
    <Box component="header" sx={{ ...sx }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 2, md: 3.5 } }}>
        <Box
          component="img"
          src={monogram}
          alt=""
          aria-hidden="true"
          sx={{ width: 36, height: 36, mt: 0.5, flexShrink: 0, display: "block" }}
        />
        <Box sx={{ minWidth: 0 }}>
          {kicker ? (
            <Typography
              variant="overline"
              component="p"
              sx={{ color: "thb.greyGreen", letterSpacing: "0.18em" }}
            >
              {kicker}
            </Typography>
          ) : null}

          <Typography variant="h1" component="h1" sx={{ mt: kicker ? 1.5 : 0 }}>
            <Box
              component="span"
              sx={{ display: "block", whiteSpace: { xs: "normal", md: "nowrap" } }}
            >
              {t.seriesName}
            </Box>
            <Box
              component="span"
              sx={{
                display: "block",
                mt: 1,
                fontSize: { xs: "1.5rem", sm: "1.875rem" },
                lineHeight: 1.3,
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              {t.country} | {formatPeriod(edition, contentLang)}
            </Box>
          </Typography>

          {strapline ? (
            <Typography
              component="p"
              sx={{
                mt: 2.75,
                fontSize: { xs: "1rem", sm: "1.125rem" },
                lineHeight: 1.62,
                color: "thb.greyGreen",
                maxWidth: READING_WIDTH,
              }}
            >
              {strapline}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 3.5, md: 4.75 }, height: "1px", backgroundColor: "thb.terracotta" }} />

      <Box
        sx={{
          mt: 2.25,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          columnGap: 5,
          rowGap: 1,
        }}
      >
        <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
          {meta.map((item, index) => (
            <Box component="span" key={item.key}>
              {index > 0 ? " · " : ""}
              {item.value}
            </Box>
          ))}
        </Typography>

        <Typography
          variant="caption"
          component="p"
          sx={{ color: "thb.greyGreen", whiteSpace: "nowrap" }}
        >
          {t.language}{" "}
          <Box component="span" sx={{ color: "thb.petroleum", fontWeight: 600 }}>
            {contentLang.toUpperCase()}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
