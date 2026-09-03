import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import { SITE_ORIGIN, useHead } from "../../lib/head";
import { editionTitle, formatDate, formatPeriod } from "../../lib/format";
import { getEditions, getLatest, groupByYear } from "../../content/editions";
import { pick, useThbLang } from "../lang";
import { LangNotice, Rule } from "../components";
import monogram from "../assets/thb-monogram.svg";
import { READING_WIDTH } from "../theme";

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
      sx={{ backgroundColor: "thb.ivory", pb: { xs: 8, md: 12 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "grid",
          gap: { xs: 5, md: 8 },
        }}
      >
        <Box component="header">
          {/* Running head: the section this page belongs to, above the rule. */}
          <Box sx={{ py: { xs: 2.5, md: 3.25 }, borderBottom: "1px solid", borderColor: "thb.beige" }}>
            <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
              {t.knowledgeCentre}
            </Typography>
          </Box>

          <Box
            sx={{
              mt: { xs: 5, md: 8 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, md: 3.25 },
            }}
          >
            <Box
              component="img"
              src={monogram}
              alt=""
              aria-hidden="true"
              sx={{ width: 44, height: 44, flexShrink: 0, display: "block" }}
            />
            <Typography variant="h1" component="h1">
              {t.seriesName}
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 3, md: 4.25 }, height: "1px", backgroundColor: "thb.terracotta" }} />

          <Typography
            component="p"
            sx={{
              mt: { xs: 3, md: 4.25 },
              fontSize: { xs: "1rem", sm: "1.03125rem" },
              lineHeight: 1.68,
              color: "thb.petroleum",
              maxWidth: READING_WIDTH,
            }}
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
              display: "grid",
              alignItems: "start",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 520fr) minmax(0, 584fr)",
              },
              columnGap: { md: 9.5 },
              rowGap: { xs: 5, md: 0 },
            }}
          >
            {/* The edition's LinkedIn card, framed by an offset beige hairline. */}
            <Box sx={{ position: "relative", pr: "14px", pb: "14px" }}>
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  left: "14px",
                  top: "14px",
                  right: 0,
                  bottom: 0,
                  border: "1px solid",
                  borderColor: "thb.beige",
                }}
              />
              <Box
                component="img"
                src={`/og/thb-${latest.id}-${contentLang}.png`}
                alt={editionTitle(latest, contentLang)}
                width={1200}
                height={630}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  display: "block",
                  width: "100%",
                  height: "auto",
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                id="thb-latest"
                variant="overline"
                component="h2"
                sx={{ color: "thb.greyGreen", m: 0 }}
              >
                {t.latestEdition}
              </Typography>

              <Typography variant="caption" component="p" sx={{ mt: 1.75, color: "thb.greyGreen" }}>
                {t.horizons?.[latest.horizon] ?? latest.horizon}
              </Typography>

              <Typography variant="h2" component="p" sx={{ mt: 1, fontSize: "1.875rem" }}>
                {t.country} | {formatPeriod(latest, contentLang)}
              </Typography>

              <Box sx={{ my: 3, height: "1px", backgroundColor: "thb.beige" }} />

              <Typography
                component="p"
                sx={{ fontSize: "1rem", lineHeight: 1.68, color: "thb.petroleum" }}
              >
                {pick(latest.takeaway, contentLang)}
              </Typography>

              <Box
                sx={{
                  mt: 3.75,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: 3.5,
                }}
              >
                <MuiLink
                  component={RouterLink}
                  to={`${basePath}${latest.id}/`}
                  sx={{ color: "thb.petroleum", fontWeight: 600 }}
                >
                  {t.readEdition}
                </MuiLink>
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

        <Box component="section" aria-labelledby="thb-archive">
          <Typography id="thb-archive" variant="h2" component="h2">
            {t.archive}
          </Typography>
          <Box sx={{ mt: 2.75, height: "2px", backgroundColor: "thb.petroleum" }} />

          {archive.length ? (
            <Box sx={{ mt: 3.25, display: "grid", gap: 4 }}>
              {archive.map(({ year, editions: yearEditions }) => (
                <Box key={year}>
                  <Typography
                    variant="overline"
                    component="h3"
                    sx={{ color: "thb.greyGreen", m: 0 }}
                  >
                    {year}
                  </Typography>
                  <Box
                    component="ul"
                    role="list"
                    sx={{ listStyle: "none", m: 0, mt: 2, p: 0, display: "grid", gap: 0 }}
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

                        <Typography
                          variant="caption"
                          component="p"
                          sx={{ color: "thb.greyGreen" }}
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
            <Typography variant="h3" component="h2" sx={{ mt: 2.5 }}>
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
      </Box>
    </Box>
  );
}
