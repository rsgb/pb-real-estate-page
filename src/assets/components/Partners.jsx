import { Box, Typography } from "@mui/material";
import { useLang } from "./LangContext";
import kwLogo from "../images/KWsol black.png";
import chambersLogo from "../images/chambers black.png";
import interiorLogo from "../images/host.png";

export default function Partners() {
  const { lang } = useLang();

  let subtitles = [];
  let partnershipLabel = "In partnership with";

  if (lang === "EN") {
    subtitles = ["Real Estate", "Law Firm", "Interior Design"];
    partnershipLabel = "In partnership with";
  } else if (lang === "PT") {
    subtitles = [
      "Imobiliário",
      "Sociedade de Advogados",
      "Design de Interiores",
    ];
    partnershipLabel = "Em parceria com";
  } else if (lang === "ES") {
    subtitles = [
      "Inmobiliario",
      "Despacho de Abogados",
      "Diseño de Interiores",
    ];
    partnershipLabel = "En colaboración con";
  } else if (lang === "FR") {
    subtitles = ["Immobilier", "Cabinet d'avocats", "Design d'intérieur"];
    partnershipLabel = "En partenariat avec";
  }

  const partnerLogos = [
    {
      logo: kwLogo,
      subtitle: subtitles[0],
      url: "https://www.kwportugal.pt/pt/agencia/KW-Sol-Oeiras/8336",
    },
    {
      logo: chambersLogo,
      subtitle: subtitles[1],
      url: "https://www.raposobernardo.com/",
    },
    {
      logo: interiorLogo,
      subtitle: subtitles[2],
      url: "https://www.hostdesigners.com/",
    },
  ];

  return (
    <Box
      component="section"
      sx={{ bgcolor: "background.default", pt: { xs: 6, md: 9.5 } }}
    >
      <Box sx={{ width: "100%", maxWidth: 1146, mx: "auto", px: 3 }}>
        {/* Caption between two hairlines */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              flex: 1,
              height: "1px",
              bgcolor: (t) => t.palette.custom.champagneHairline,
            }}
          />
          <Typography
            component="p"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "custom.textMuted",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {partnershipLabel}
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: "1px",
              bgcolor: (t) => t.palette.custom.champagneHairline,
            }}
          />
        </Box>

        {/* Logos */}
        <Box
          sx={(theme) => ({
            mt: { xs: "26px", md: "38px" },
            borderTop: `1px solid ${theme.palette.custom.hairline}`,
            borderBottom: `1px solid ${theme.palette.custom.hairline}`,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          })}
        >
          {partnerLogos.map((partner, index) => (
            <Box
              key={partner.url}
              component="a"
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={(theme) => ({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                p: { xs: "30px 24px", md: "40px 30px 34px" },
                borderBottom:
                  index < partnerLogos.length - 1
                    ? {
                        xs: `1px solid ${theme.palette.custom.hairline}`,
                        md: "none",
                      }
                    : "none",
                borderRight:
                  index < partnerLogos.length - 1
                    ? {
                        xs: "none",
                        md: `1px solid ${theme.palette.custom.hairline}`,
                      }
                    : "none",
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.custom.champagne}`,
                  outlineOffset: -2,
                },
              })}
            >
              <Box
                sx={{
                  width: "100%",
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={partner.logo}
                  alt={partner.subtitle}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Typography
                component="p"
                sx={{
                  mt: { xs: "18px", md: "22px" },
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: { xs: "13.5px", md: "13px" },
                  lineHeight: 1.6,
                  color: "custom.textMuted",
                  textAlign: "center",
                }}
              >
                {partner.subtitle}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
