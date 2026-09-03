import { Box, Button, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import { SITE_ORIGIN, useHead } from "../../lib/head";
import { editionTitle, formatDate, formatPeriod } from "../../lib/format";
import { getEditions, getLatest, groupByYear } from "../../content/editions";
import { pick, useThbLang } from "../lang";
import { LangNotice, Rule, ThbMark } from "../components";
import { READING_WIDTH } from "../theme";

/**
 * Market Brief landing page, version 2 — a temporary page at
 * /:lang/market-brief/v2/ built to be compared side by side with the live one
 * (SeriesPage.jsx), which stays untouched.
 *
 * What changes, and why:
 *  - One focal point. The latest edition is a white panel with a petroleum top
 *    edge, holding the only button on the page; everything else is flat on the
 *    ivory ground, so the eye lands on the panel first.
 *  - Three zones you can tell apart without reading: head, latest edition,
 *    archive, about. Zones are 64px apart on md+, while nothing inside a zone
 *    is more than 24px from its neighbour, so the grouping reads as grouping.
 *  - The "+" monogram is replaced by the lettered THB mark: a circled plus next
 *    to a heading reads as an "add" button.
 *
 * The page is noindex and canonicalises to v1, and carries no hreflang: it is a
 * comparison surface, not a public URL.
 */
export default function SeriesPageV2() {
  const { lang } = useParams();
  const { siteLang, urlLang, contentLang, t, isTranslated } = useThbLang();
  const basePath = `/${lang ?? urlLang}/market-brief/`;

  const latest = getLatest();
  const editions = getEditions();
  // The archive lists every edition, the latest included: with a single edition
  // a filtered archive would render an empty section.
  const archive = groupByYear(editions);
  const latestHorizon = latest ? (t.horizons?.[latest.horizon] ?? latest.horizon) : "";

  useHead({
    title: `${t.seriesName} | ${t.country}`,
    description: t.seriesTagline,
    lang: String(siteLang).toLowerCase(),
    // Temporary comparison page: never indexed, and it points search engines at
    // the real landing page instead of at itself.
    canonical: `${SITE_ORIGIN}/${contentLang}/market-brief/`,
    og: { title: `${t.seriesName} | ${t.country}`, description: t.seriesTagline, type: "website" },
    robots: "noindex",
  });

  return (
    <Box
      component="main"
      lang={isTranslated ? undefined : contentLang}
      sx={{ backgroundColor: "thb.ivory", pt: { xs: 3, md: 4.5 }, pb: { xs: 8, md: 12 } }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "grid",
          // Zone separation: clearly larger than any gap inside a zone.
          gap: { xs: 5, md: 8 },
        }}
      >
        {/* ------------------------------------------------------ page head */}
        <Box component="header">
          <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
            {t.knowledgeCentre}
          </Typography>

          <Box
            sx={{
              mt: { xs: 2, md: 2.5 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, md: 2.5 },
            }}
          >
            <ThbMark size={44} />
            <Typography variant="h1" component="h1">
              {t.seriesName}
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 2.5, md: 3 }, height: "1px", backgroundColor: "thb.terracotta" }} />

          <Typography
            component="p"
            sx={{
              mt: { xs: 2.5, md: 3 },
              fontSize: { xs: "0.9375rem", sm: "1rem" },
              lineHeight: 1.68,
              color: "thb.greyGreen",
              maxWidth: READING_WIDTH,
            }}
          >
            {t.seriesTagline}
          </Typography>
        </Box>

        <LangNotice />

        {/* ------------------------------- zone 1: the latest edition (hero) */}
        {latest ? (
          <Box
            component="section"
            aria-labelledby="thb-v2-latest"
            sx={{
              backgroundColor: "thb.white",
              border: "1px solid",
              borderColor: "thb.beige",
              borderTop: "2px solid",
              borderTopColor: "thb.petroleum",
              px: { xs: 2.5, sm: 4, md: 6 },
              py: { xs: 3.5, md: 6 },
              display: "grid",
              alignItems: "center",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "44fr 56fr" },
              columnGap: { md: 6 },
              rowGap: 3,
            }}
          >
            {/* The edition's LinkedIn card, inside a beige hairline. */}
            <Box
              component="img"
              src={`/og/thb-${latest.id}-${contentLang}.png`}
              alt={editionTitle(latest, contentLang)}
              width={1200}
              height={630}
              sx={{
                display: "block",
                width: "100%",
                height: "auto",
                border: "1px solid",
                borderColor: "thb.beige",
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                id="thb-v2-latest"
                variant="overline"
                component="h2"
                sx={{ m: 0, color: "thb.greyGreen" }}
              >
                {t.latestEdition} · {latestHorizon}
              </Typography>

              <Typography
                variant="h2"
                component="p"
                sx={{ mt: 1.5, fontSize: { xs: "1.625rem", md: "2rem" } }}
              >
                {t.country} | {formatPeriod(latest, contentLang)}
              </Typography>

              <Typography
                component="p"
                sx={{
                  mt: 2,
                  fontSize: "1.125rem",
                  lineHeight: 1.6,
                  color: "thb.petroleum",
                  maxWidth: READING_WIDTH,
                }}
              >
                {pick(latest.takeaway, contentLang)}
              </Typography>

              {/* The only button on the page. */}
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2.5,
                }}
              >
                <Button
                  component={RouterLink}
                  to={`${basePath}${latest.id}/`}
                  variant="contained"
                  sx={{
                    backgroundColor: "thb.petroleum",
                    color: "thb.ivory",
                    borderRadius: 0,
                    minHeight: 44,
                    px: 3.5,
                    fontSize: "1rem",
                    "&:hover": { backgroundColor: "thb.petroleum", opacity: 0.9 },
                  }}
                >
                  {t.readEdition}
                </Button>
                <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                  {t.publishedOn}{" "}
                  <time dateTime={latest.publishedAt}>
                    {formatDate(latest.publishedAt, contentLang)}
                  </time>
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : null}

        {/* ------------------------------------------- zone 2: the archive */}
        <Box component="section" aria-labelledby="thb-v2-archive">
          <Typography
            id="thb-v2-archive"
            variant="overline"
            component="h2"
            sx={{ m: 0, color: "thb.greyGreen" }}
          >
            {t.archive}
          </Typography>

          {archive.length ? (
            <Box sx={{ mt: 2.5, display: "grid", gap: 3 }}>
              {archive.map(({ year, editions: yearEditions }) => (
                <Box key={year}>
                  <Typography
                    variant="overline"
                    component="h3"
                    sx={{ m: 0, fontSize: "0.6875rem", color: "thb.greyGreen" }}
                  >
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
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "7rem minmax(0, 15rem) 11rem minmax(0, 1fr)",
                          },
                          alignItems: "center",
                          gap: { xs: 0.75, md: 3 },
                          borderTop: "1px solid",
                          borderColor: "thb.beige",
                          py: 2.75,
                          "&:last-of-type": { borderBottom: "1px solid", borderColor: "thb.beige" },
                        }}
                      >
                        <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                          {t.horizons?.[edition.horizon] ?? edition.horizon}
                        </Typography>

                        <MuiLink
                          component={RouterLink}
                          to={`${basePath}${edition.id}/`}
                          sx={{ color: "thb.petroleum", fontWeight: 600, fontSize: "1.0625rem" }}
                        >
                          {t.country} | {formatPeriod(edition, contentLang)}
                        </MuiLink>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          {edition.id === latest?.id ? (
                            <>
                              <Rule width={16} />
                              <Typography
                                component="p"
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  color: "thb.petroleum",
                                }}
                              >
                                {t.latestBadge}
                              </Typography>
                            </>
                          ) : null}
                        </Box>

                        <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
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
        </Box>

        {/* --------------------------------------- zone 3: about the series */}
        <Box component="section" aria-labelledby="thb-v2-author">
          <Box
            sx={{
              backgroundColor: "thb.white",
              border: "1px solid",
              borderColor: "thb.beige",
              px: { xs: 2.5, sm: 4, md: 5.75 },
              py: { xs: 3.5, md: 5 },
              display: "grid",
              alignItems: "start",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "18.75rem minmax(0, 1fr)" },
              columnGap: { md: 7.5 },
              rowGap: 3,
            }}
          >
            <Box>
              <Rule width={44} />
              <Typography id="thb-v2-author" variant="h3" component="h2" sx={{ mt: 2.5 }}>
                {t.author.name}
              </Typography>
              <Typography
                variant="body2"
                component="p"
                sx={{ mt: 1, color: "thb.greyGreen", fontWeight: 500 }}
              >
                {t.author.role}
              </Typography>
            </Box>
            <Typography
              component="p"
              sx={{
                fontSize: "1rem",
                lineHeight: 1.68,
                color: "thb.petroleum",
                maxWidth: READING_WIDTH,
              }}
            >
              {t.author.bio}
            </Typography>
          </Box>

          <MuiLink
            component={RouterLink}
            to={`${basePath}methodology/`}
            sx={{ display: "inline-block", mt: 2.5, color: "thb.petroleum", fontWeight: 600 }}
          >
            {t.readMethodology}
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
}
