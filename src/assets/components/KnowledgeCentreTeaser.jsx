import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useLang, toContentLang } from "./LangContext";
import { getLatest } from "../../content/editions";
import { contentUi } from "../../content/ui";
import { formatDate, formatPeriod } from "../../lib/format";
import { pick } from "../../knowledge-centre/lang";

/**
 * Home-page teaser for the Knowledge Centre: the latest edition of the
 * Tourism & Hospitality Brief, on the navy band.
 *
 * The Brief is authored in PT and EN only, so ES and FR visitors see the
 * English edition (D-03); the two link labels below are the one exception and
 * are shown in the visitor's own language.
 */
const LINKS = {
  PT: { read: "Ler a edição", all: "Ver todas as edições" },
  EN: { read: "Read the edition", all: "All editions" },
  ES: { read: "Leer la edición", all: "Todas las ediciones" },
  FR: { read: "Lire l'édition", all: "Toutes les éditions" },
};

export default function KnowledgeCentreTeaser() {
  const { lang, urlLang } = useLang();
  const latest = getLatest();
  if (!latest) return null;

  const contentLang = toContentLang(lang);
  const t = contentUi(contentLang);
  const labels = LINKS[lang] ?? LINKS.PT;

  const title = t.seriesName;
  const editionLine = [
    `${t.country} | ${formatPeriod(latest, contentLang)}`,
    t.horizons?.[latest.horizon],
    `${t.publishedOn.toLowerCase()} ${formatDate(latest.publishedAt, contentLang)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const cardSrc = `/og/thb-${latest.id}-${contentLang}.png`;

  const linkBase = (theme) => ({
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "0.03em",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    minHeight: { xs: 44, md: "auto" },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.custom.champagne}`,
      outlineOffset: 3,
    },
  });

  return (
    <Box
      component="section"
      aria-labelledby="kc-teaser-title"
      sx={{ bgcolor: "custom.navy", py: { xs: 6, md: 9.5 } }}
    >
      <Box sx={{ width: "100%", maxWidth: 1146, mx: "auto", px: 3 }}>
        <Box
          sx={{
            height: "1px",
            backgroundColor: "rgba(200, 178, 122, 0.55)",
            mb: { xs: "32px", md: "52px" },
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "460px minmax(0, 1fr)" },
            gap: { xs: 5, md: 9.5 },
            alignItems: "center",
          }}
        >
          {/* LinkedIn card of the latest edition, in a champagne frame */}
          <Box
            sx={{
              position: "relative",
              mr: { xs: "10px", md: "14px" },
              "&::after": {
                content: '""',
                position: "absolute",
                left: { xs: 10, md: 14 },
                top: { xs: 10, md: 14 },
                right: { xs: -10, md: -14 },
                bottom: { xs: -10, md: -14 },
                border: "1px solid rgba(200, 178, 122, 0.75)",
              },
            }}
          >
            <Box
              component="img"
              src={cardSrc}
              alt={pick(latest.title, contentLang)}
              sx={{
                position: "relative",
                zIndex: 1,
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />
          </Box>

          {/* Text column */}
          <Box>
            <Typography
              component="p"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "custom.champagne",
              }}
            >
              {t.knowledgeCentre}
            </Typography>

            <Typography
              id="kc-teaser-title"
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: "25px", md: "30px" },
                lineHeight: 1.3,
                color: "custom.warmWhite",
                mt: "16px",
              }}
            >
              {title}
            </Typography>

            <Typography
              component="p"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "custom.onNavyMuted",
                mt: "14px",
              }}
            >
              {editionLine}
            </Typography>

            <Box
              sx={{
                height: "1px",
                backgroundColor: "rgba(200, 178, 122, 0.30)",
                my: "24px",
              }}
            />

            <Typography
              component="p"
              sx={{
                fontFamily: "'Libre Baskerville', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: { xs: "16px", md: "18px" },
                lineHeight: 1.8,
                color: "custom.warmWhite",
                maxWidth: 560,
              }}
            >
              {pick(latest.takeaway, contentLang)}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                gap: { xs: 0.5, md: "30px" },
                mt: { xs: "20px", md: "30px" },
              }}
            >
              <Box
                component={RouterLink}
                to={`/${urlLang}/knowledge-centre/${latest.id}/`}
                sx={[
                  linkBase,
                  {
                    fontSize: { xs: "15px", md: "13.5px" },
                    fontWeight: 600,
                    color: "custom.champagne",
                    borderBottom: {
                      xs: "none",
                      md: "1px solid rgba(200, 178, 122, 0.55)",
                    },
                    pb: { md: "4px" },
                  },
                ]}
              >
                {labels.read}
                <Box component="span" aria-hidden="true" sx={{ ml: "6px" }}>
                  &rarr;
                </Box>
              </Box>

              <Box
                component={RouterLink}
                to={`/${urlLang}/knowledge-centre/`}
                sx={[
                  linkBase,
                  {
                    fontSize: { xs: "15px", md: "13.5px" },
                    fontWeight: 500,
                    color: "custom.onNavyMuted",
                  },
                ]}
              >
                {labels.all}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
