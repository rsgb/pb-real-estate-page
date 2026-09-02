import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import { SITE_ORIGIN, useHead } from "../../lib/head";
import { useThbLang } from "../lang";
import { LangNotice, RichText } from "../components";
import { READING_WIDTH } from "../theme";

export default function MethodologyPage() {
  const { lang } = useParams();
  const { siteLang, urlLang, contentLang, t, isTranslated } = useThbLang();
  const basePath = `/${lang ?? urlLang}/knowledge-centre/`;
  const title = `${t.methodology} | ${t.seriesName}`;
  const description = t.methodologyParagraphs[0];

  useHead({
    title,
    description,
    lang: String(siteLang).toLowerCase(),
    canonical: `${SITE_ORIGIN}/${contentLang}/knowledge-centre/methodology/`,
    alternates: [
      { lang: "pt", href: `${SITE_ORIGIN}/pt/knowledge-centre/methodology/` },
      { lang: "en", href: `${SITE_ORIGIN}/en/knowledge-centre/methodology/` },
    ],
    og: { title, description, type: "article" },
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
          gap: { xs: 4, md: 5 },
        }}
      >
        <Box component="header">
          <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
            {t.seriesName}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ mt: 1, color: "thb.petroleum" }}>
            {t.methodology}
          </Typography>
          <Box sx={{ height: "3px", width: 64, backgroundColor: "thb.terracotta", mt: 2 }} />
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
