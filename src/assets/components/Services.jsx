import { useLang } from "./LangContext";
import { Grid, Typography, Box, Paper } from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import PublicIcon from "@mui/icons-material/Public";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GavelIcon from "@mui/icons-material/Gavel";

const features = [
  {
    icon: <HotelIcon sx={{ color: "black", fontSize: { xs: 40, md: 46 } }} />,
    text: "",
  },
  {
    icon: <PublicIcon sx={{ color: "black", fontSize: { xs: 40, md: 46 } }} />,
    text: "",
  },
  {
    icon: <PeopleAltIcon sx={{ color: "black", fontSize: { xs: 40, md: 46 } }} />,
    text: "",
  },
  {
    icon: <GavelIcon sx={{ color: "black", fontSize: { xs: 40, md: 46 } }} />,
    text: "",
  },
];

const _bgColors = [
  "#f4f1eb",
  "#f4f1eb",
  "#f4f1eb",
  "#f4f1eb",
];

function FeatureHighlights() {
  const { lang } = useLang();

  let services = "";
  let description;

  if (lang === "EN") {
    services = "Services";
    features[0].text =
      "High expertise in hotel, leisure and senior living investments";
    features[1].text = "Wide national and international contact network";
    features[2].text = "Coordination of multidisciplinary teams";
    features[3].text = "Specialized legal advisory";
    description =
      "Whether acquiring premium assets or placing yours on the market, I provide a personalised and discreet service, backed by three decades of consolidated expertise and a trusted partner network — ensuring secure and profitable transactions.";
  } else if (lang === "PT") {
    services = "Serviços";
    features[0].text =
      "Especialização em investimento hoteleiro, lazer e residências sénior";
    features[1].text = "Rede de contactos nacional e internacional";
    features[2].text = "Capacidade para articular equipas multidisciplinares";
    features[3].text = "Aconselhamento jurídico especializado";
    description =
      "Quer pretenda adquirir activos de excelência ou colocar os seus no mercado, ofereço um serviço personalizado e discreto, apoiado em três décadas de experiência consolidada e numa rede de parceiros de confiança — garantindo transacções seguras e rentáveis.";
  } else if (lang === "ES") {
    services = "Servicios";
    features[0].text =
      "Especialización en inversión hotelera, ocio y residencias senior";
    features[1].text = "Red de contactos nacional e internacional";
    features[2].text = "Capacidad para coordinar equipos multidisciplinares";
    features[3].text = "Asesoramiento jurídico especializado";
    description =
      "Ya sea para adquirir activos premium o poner los suyos en el mercado, ofrezco un servicio personalizado y discreto, respaldado por tres décadas de experiencia consolidada y una red de socios de confianza — asegurando operaciones seguras y rentables.";
  } else if (lang === "FR") {
    services = "Services";
    features[0].text =
      "Spécialisation en investissement hôtelier, loisirs et résidences seniors";
    features[1].text = "Réseau de contacts national et international";
    features[2].text = "Capacité à coordonner des équipes multidisciplinaires";
    features[3].text = "Conseil juridique spécialisé";
    description =
      "Que vous souhaitiez acquérir des biens d’exception ou mettre les vôtres sur le marché, je propose un service personnalisé et discret, fort de trois décennies d’expertise consolidée et d’un réseau de partenaires de confiance — garantissant des transactions sûres et rentables.";
  }

  return (
    <Box
      sx={{
        maxWidth: { xs: "350px", md: "748px", lg: "1146px" },
        mt: { xs: 6, md: 8 },
      }}
      mx="auto"
      px={0}
    >
      {/* Heading */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: "'Libre Baskerville', serif",
          fontWeight: 700,
          fontSize: { xs: "2rem", md: "2.5rem" },
          display: "inline-block",
          borderBottom: (theme) => `2px solid ${theme.palette.custom.champagne}`,
          pb: 0.75,
          mb: 4,
        }}
      >
        {services}
      </Typography>

      {/* Description */}
      <Box
        sx={{
          borderLeft: (theme) => `4px solid ${theme.palette.custom.champagne}`,
          pl: 4,
          py: 3,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.custom.champagneHairline} 0%, transparent 100%)`,
          borderRadius: "0 8px 8px 0",
          mb: 6,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: { xs: "1.1rem", md: "1.2rem" },
            lineHeight: 1.7,
            fontStyle: "italic",
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Feature cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // 1 per row on small screens
            md: "repeat(4, 1fr)", // 4 per row on medium and large screens
          },
          gap: 3,
          justifyContent: "center",
        }}
      >
        {features.map(({ text, icon }, index) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              p: { xs: 2, md: 2.5 },
              width: "100%",
              aspectRatio: { xs: "auto", md: "1 / 1" },
              backgroundColor: "background.paper",
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
              display: "flex",
              flexDirection: "column",
              borderTop: (theme) => `1px solid ${theme.palette.custom.champagneHairline}`,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                color: "text.primary",
                "& svg": { color: "text.primary" },
              }}
            >
              <Box
                sx={{
                  height: { xs: 48, md: 56 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  mb: 1.5,
                }}
              >
                {icon}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  textAlign: "center",
                  wordBreak: "break-word",
                  width: "100%",
                }}
              >
                {text}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default FeatureHighlights;
