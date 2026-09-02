import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import { SITE_ORIGIN, useHead } from "../../lib/head";
import { formatDate, formatPeriod } from "../../lib/format";
import { getEditions, getLatest, groupByYear } from "../../content/editions";
import { pick, useThbLang } from "../lang";
import { LangNotice, Takeaway } from "../components";
import monogram from "../assets/thb-monogram.svg";
import { READING_WIDTH } from "../theme";

/** Small uppercase horizon badge used across the archive. */
function HorizonBadge({ children, highlight = false }) {
  return (
    <Box
      component="span"
      sx={{
        border: "1px solid",
        borderColor: highlight ? "thb.petroleum" : "thb.beige",
        color: highlight ? "thb.petroleum" : "thb.greyGreen",
        px: 1,
        py: 0.25,
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

export default function SeriesPage() {
  const { lang } = useParams();
  const { siteLang, urlLang, contentLang, t, isTranslated } = useThbLang();
  const basePath = `/${lang ?? urlLang}/knowledge-centre/`;

  const latest = getLatest();
  const editions = getEditions();
  // The archive lists every edition, the latest included: with a single edition
  // a filtered archive would render an empty section.
  const archive = groupByYear(editions);

  useHead({
    title: `${t.seriesName} | ${t.country}`,
    description: t.seriesTagline,
    lang: String(siteLang).toLowerCase(),
    canonical: `${SITE_ORIGIN}/${contentLang}/knowledge-centre/`,
    alternates: [
      { lang: "pt", href: `${SITE_ORIGIN}/pt/knowledge-centre/` },
      { lang: "en", href: `${SITE_ORIGIN}/en/knowledge-centre/` },
    ],
    og: { title: `${t.seriesName} | ${t.country}`, description: t.seriesTagline, type: "website" },
    ...(isTranslated ? {} : { robots: "noindex" }),
  });

  return (
    <Box
      component="main"
      lang={isTranslated ? undefined : contentLang}
      sx={{ backgroundColor: "thb.ivory", py: { xs: 4, md: 7 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "grid",
          gap: { xs: 5, md: 7 },
        }}
      >
        <Box component="header">
          <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
            {t.knowledgeCentre}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="img"
              src={monogram}
              alt=""
              aria-hidden="true"
              sx={{ width: 40, height: 40, flexShrink: 0, display: "block" }}
            />
            <Typography variant="h1" component="h1" sx={{ color: "thb.petroleum" }}>
              {t.seriesName}
            </Typography>
          </Box>
          <Box sx={{ height: "3px", width: 64, backgroundColor: "thb.terracotta", mt: 2 }} />
          <Typography
            variant="subtitle1"
            component="p"
            sx={{ mt: 2.5, color: "thb.greyGreen", maxWidth: READING_WIDTH }}
          >
            {t.seriesTagline}
          </Typography>
        </Box>

        <LangNotice />

        {latest ? (
          <Box
            component="section"
            aria-labelledby="thb-latest"
            sx={{
              backgroundColor: "thb.white",
              border: "1px solid",
              borderColor: "thb.beige",
              p: { xs: 2, sm: 3, md: 4 },
              display: "grid",
              gap: 2.5,
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
              <Typography id="thb-latest" variant="overline" component="h2" sx={{ color: "thb.greyGreen", m: 0 }}>
                {t.latestEdition}
              </Typography>
              <HorizonBadge>{t.horizons?.[latest.horizon] ?? latest.horizon}</HorizonBadge>
            </Box>

            <Typography variant="h2" component="p" sx={{ color: "thb.petroleum" }}>
              {t.country} | {formatPeriod(latest, contentLang)}
            </Typography>

            <Takeaway text={pick(latest.takeaway, contentLang)} label={t.executiveTakeaway} />

            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 2 }}>
              <MuiLink
                component={RouterLink}
                to={`${basePath}${latest.id}/`}
                sx={{ color: "thb.petroleum", fontWeight: 600 }}
              >
                {t.readEdition}
              </MuiLink>
              <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                {t.publishedOn}{" "}
                <time dateTime={latest.publishedAt}>{formatDate(latest.publishedAt, contentLang)}</time>
              </Typography>
            </Box>
          </Box>
        ) : null}

        <Box component="section" aria-labelledby="thb-archive">
          <Typography id="thb-archive" variant="overline" component="h2" sx={{ color: "thb.greyGreen", m: 0 }}>
            {t.archive}
          </Typography>

          {archive.length ? (
            <Box sx={{ mt: 2, display: "grid", gap: 4 }}>
              {archive.map(({ year, editions: yearEditions }) => (
                <Box key={year}>
                  <Typography variant="h3" component="h3" sx={{ color: "thb.petroleum" }}>
                    {year}
                  </Typography>
                  <Box
                    component="ul"
                    role="list"
                    sx={{ listStyle: "none", m: 0, mt: 1.5, p: 0, display: "grid", gap: 0 }}
                  >
                    {yearEditions.map((edition) => (
                      <Box
                        component="li"
                        role="listitem"
                        key={edition.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "auto 1fr auto" },
                          alignItems: "center",
                          gap: { xs: 0.75, sm: 2 },
                          borderTop: "1px solid",
                          borderColor: "thb.beige",
                          py: 1.5,
                        }}
                      >
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          <HorizonBadge>{t.horizons?.[edition.horizon] ?? edition.horizon}</HorizonBadge>
                          {edition.id === latest?.id ? (
                            <HorizonBadge highlight>{t.latestBadge}</HorizonBadge>
                          ) : null}
                        </Box>
                        <MuiLink
                          component={RouterLink}
                          to={`${basePath}${edition.id}/`}
                          sx={{ color: "thb.petroleum", fontWeight: 600 }}
                        >
                          {t.country} | {formatPeriod(edition, contentLang)}
                        </MuiLink>
                        <Typography
                          variant="caption"
                          component="p"
                          sx={{ color: "thb.greyGreen", textAlign: { xs: "left", sm: "right" } }}
                        >
                          {t.publishedOn}{" "}
                          <time dateTime={edition.publishedAt}>
                            {formatDate(edition.publishedAt, contentLang)}
                          </time>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : null}

          <MuiLink
            component={RouterLink}
            to={`${basePath}methodology/`}
            sx={{ display: "inline-block", mt: 3, color: "thb.petroleum", fontWeight: 600 }}
          >
            {t.readMethodology}
          </MuiLink>
        </Box>

        <Box
          component="section"
          aria-label={t.author.name}
          sx={{
            borderTop: "1px solid",
            borderColor: "thb.beige",
            pt: 3,
            maxWidth: READING_WIDTH,
          }}
        >
          <Typography variant="h3" component="h2" sx={{ color: "thb.petroleum" }}>
            {t.author.name}
          </Typography>
          <Typography variant="body2" component="p" sx={{ mt: 0.5, color: "thb.greyGreen" }}>
            {t.author.role}
          </Typography>
          <Typography variant="body1" component="p" sx={{ mt: 2, color: "thb.petroleum" }}>
            {t.author.bio}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
