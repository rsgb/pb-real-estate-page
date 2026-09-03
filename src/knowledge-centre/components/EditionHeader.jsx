import { Box, Typography } from "@mui/material";
import { formatDate, formatPeriod } from "../../lib/format";
import { pick, useThbLang } from "../lang";
import ThbMark from "./ThbMark";
import { READING_WIDTH } from "../theme";

/**
 * Edition header (Componentes Visuais v0.9 s.4): series, country and period,
 * editorial horizon, language, publication date and data status.
 *
 * It is the page's focal point, in the landing page's language: a white panel
 * on a 2px petroleum top edge, beige hairlines on the other three sides. The
 * nameplate runs quiet to loud — section overline, then the series name beside
 * the lettered THB mark, then the period as the largest heading on the page —
 * so the reader knows where they are before reading a single sentence. The
 * metadata stays one plain line under the terracotta rule, and the panel holds
 * no button: the executive takeaway lives in the executive summary.
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

  const overline = [t.knowledgeCentre, kicker].filter(Boolean).join(" · ");

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
    <Box
      component="header"
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        borderTop: "2px solid",
        borderTopColor: "thb.petroleum",
        px: { xs: 2.5, sm: 4, md: 6 },
        py: { xs: 3.5, md: 5.5 },
        ...sx,
      }}
    >
      <Typography
        variant="overline"
        component="p"
        sx={{ color: "thb.greyGreen", letterSpacing: "0.18em" }}
      >
        {overline}
      </Typography>

      <Box
        sx={{
          mt: { xs: 2, md: 2.5 },
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.75, md: 2.25 },
        }}
      >
        <ThbMark size={36} />
        <Typography variant="h2" component="p" sx={{ minWidth: 0 }}>
          {t.seriesName}
        </Typography>
      </Box>

      <Typography variant="h1" component="h1" sx={{ mt: { xs: 1.5, md: 2 } }}>
        {t.country} | {formatPeriod(edition, contentLang)}
      </Typography>

      {strapline ? (
        <Typography
          component="p"
          sx={{
            mt: { xs: 2, md: 2.5 },
            fontSize: { xs: "1rem", sm: "1.125rem" },
            lineHeight: 1.62,
            color: "thb.greyGreen",
            maxWidth: READING_WIDTH,
          }}
        >
          {strapline}
        </Typography>
      ) : null}

      <Box sx={{ mt: 3, height: "1px", backgroundColor: "thb.terracotta" }} />

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
