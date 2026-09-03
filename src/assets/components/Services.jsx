import { Box, Paper, Typography } from "@mui/material";
import { useLang } from "./LangContext";
import { BedIcon, GlobeIcon, TeamIcon, GavelIcon } from "./icons.jsx";

const ICONS = [BedIcon, GlobeIcon, TeamIcon, GavelIcon];

const COPY = {
  EN: {
    heading: "Services",
    description:
      "Whether acquiring premium assets or placing yours on the market, I provide a personalised and discreet service, backed by three decades of consolidated expertise and a trusted partner network — ensuring secure and profitable transactions.",
    features: [
      "High expertise in hotel, leisure and senior living investments",
      "Wide national and international contact network",
      "Coordination of multidisciplinary teams",
      "Specialized legal advisory",
    ],
  },
  PT: {
    heading: "Serviços",
    description:
      "Quer pretenda adquirir activos de excelência ou colocar os seus no mercado, ofereço um serviço personalizado e discreto, apoiado em três décadas de experiência consolidada e numa rede de parceiros de confiança — garantindo transacções seguras e rentáveis.",
    features: [
      "Especialização em investimento hoteleiro, lazer e residências sénior",
      "Rede de contactos nacional e internacional",
      "Capacidade para articular equipas multidisciplinares",
      "Aconselhamento jurídico especializado",
    ],
  },
  ES: {
    heading: "Servicios",
    description:
      "Ya sea para adquirir activos premium o poner los suyos en el mercado, ofrezco un servicio personalizado y discreto, respaldado por tres décadas de experiencia consolidada y una red de socios de confianza — asegurando operaciones seguras y rentables.",
    features: [
      "Especialización en inversión hotelera, ocio y residencias senior",
      "Red de contactos nacional e internacional",
      "Capacidad para coordinar equipos multidisciplinares",
      "Asesoramiento jurídico especializado",
    ],
  },
  FR: {
    heading: "Services",
    description:
      "Que vous souhaitiez acquérir des biens d’exception ou mettre les vôtres sur le marché, je propose un service personnalisé et discret, fort de trois décennies d’expertise consolidée et d’un réseau de partenaires de confiance — garantissant des transactions sûres et rentables.",
    features: [
      "Spécialisation en investissement hôtelier, loisirs et résidences seniors",
      "Réseau de contacts national et international",
      "Capacité à coordonner des équipes multidisciplinaires",
      "Conseil juridique spécialisé",
    ],
  },
};

export default function FeatureHighlights() {
  const { lang } = useLang();
  const { heading, description, features } = COPY[lang] ?? COPY.PT;

  return (
    <Box
      component="section"
      sx={{ bgcolor: "background.default", pb: { xs: 6.5, md: 12 } }}
    >
      <Box sx={{ width: "100%", maxWidth: 1146, mx: "auto", px: 3 }}>
        {/* Heading + rule */}
        <Box
          sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: "28px", md: "34px" },
              lineHeight: 1.2,
              color: "custom.navy",
              textAlign: "center",
            }}
          >
            {heading}
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 2,
              bgcolor: "custom.champagne",
              mt: { xs: "18px", md: "20px" },
            }}
          />
        </Box>

        {/* Quote panel — flat tint, hairline, champagne left rule */}
        <Box
          sx={(theme) => ({
            maxWidth: 940,
            mx: "auto",
            mt: { xs: "34px", md: "46px" },
            mb: { xs: "34px", md: "54px" },
            backgroundColor: "rgba(200, 178, 122, 0.12)",
            border: `1px solid ${theme.palette.custom.champagneHairline}`,
            borderLeft: `4px solid ${theme.palette.custom.champagne}`,
            p: { xs: "24px 22px 26px", md: "30px 40px 32px" },
          })}
        >
          <Typography
            component="p"
            sx={{
              fontFamily: "'Libre Baskerville', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: { xs: "16px", md: "16.5px" },
              lineHeight: 1.85,
              color: "custom.navy",
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* Four tiles */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 3.25 },
          }}
        >
          {features.map((text, index) => {
            const Icon = ICONS[index];
            return (
              <Paper
                key={text}
                elevation={0}
                sx={(theme) => ({
                  bgcolor: "background.paper",
                  border: `1px solid ${theme.palette.custom.champagneHairline}`,
                  p: { xs: "20px", md: "30px 24px 32px" },
                  display: "flex",
                  flexDirection: { xs: "row", md: "column" },
                  alignItems: { xs: "flex-start", md: "center" },
                  textAlign: { xs: "left", md: "center" },
                  gap: { xs: "18px", md: 0 },
                  minHeight: 44,
                  color: "custom.navy",
                })}
              >
                <Box
                  sx={{
                    flex: "none",
                    display: "flex",
                    mt: { xs: "2px", md: 0 },
                  }}
                >
                  <Icon size={28} />
                </Box>
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    width: 26,
                    height: "1px",
                    bgcolor: "custom.champagne",
                    my: "19px",
                  }}
                />
                <Typography
                  component="p"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "16px", md: "15px" },
                    lineHeight: 1.65,
                    color: "custom.navy",
                  }}
                >
                  {text}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
