import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import { SITE_ORIGIN, useHead } from "../../lib/head";
import { useThbLang } from "../lang";
import { LangNotice, RichText } from "../components";
import { READING_WIDTH } from "../theme";

export default function MethodologyPage() {
  const { lang } = useParams();
  const { siteLang, urlLang, contentLang, t, isTranslated } = useThbLang();
  const basePath = `/${lang ?? urlLang}/market-brief/`;
  const title = `${t.methodology} | ${t.seriesName}`;
  const description = t.methodologyParagraphs[0];

  useHead({
    title,
    description,
    lang: String(siteLang).toLowerCase(),
    canonical: `${SITE_ORIGIN}/${contentLang}/market-brief/methodology/`,
    alternates: [
      { lang: "pt", href: `${SITE_ORIGIN}/pt/market-brief/methodology/` },
      { lang: "en", href: `${SITE_ORIGIN}/en/market-brief/methodology/` },
    ],
    og: { title, description, type: "website" },
    ...(isTranslated ? {} : { robots: "noindex" }),
  });

  return (
    <Box
      component="main"
      lang={isTranslated ? undefined : contentLang}
      sx={{ backgroundColor: "thb.ivory", pt: { xs: 3, md: 4.5 }, pb: { xs: 8, md: 12 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "grid",
          // Zone separation, as on the series page.
          gap: { xs: 5, md: 8 },
        }}
      >
        {/* The series page's head, verbatim: overline, mark and serif title on
            one line, then the full-width terracotta rule. */}
        <Box component="header">
          <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
            {t.knowledgeCentre}
          </Typography>

          <Typography variant="h1" component="h1" sx={{ mt: { xs: 2, md: 2.5 } }}>
            {t.methodology}
          </Typography>

          <Box sx={{ mt: { xs: 2.5, md: 3 }, height: "1px", backgroundColor: "thb.terracotta" }} />
        </Box>

        <LangNotice />

        <RichText paragraphs={t.methodologyParagraphs} />

        <Box>
          <MuiLink component={RouterLink} to={basePath} sx={{ color: "thb.petroleum", fontWeight: 600 }}>
            {t.backToSeries}
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
}
