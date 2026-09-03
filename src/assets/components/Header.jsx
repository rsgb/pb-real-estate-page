import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useLang } from "./LangContext";
import hero from "../images/hotels.jpg";

export default function Header() {
  const { lang } = useLang();

  let title = "";
  let subtitle = "";

  if (lang === "EN") {
    title = "High-Value Real Estate Investments";
    subtitle =
      "Curated opportunities in Portugal’s most sought-after sectors, tailored for national and international clients.";
  } else if (lang === "PT") {
    title = "Investimentos Imobiliários de Alto Valor";
    subtitle =
      "Oportunidades seleccionadas nos sectores mais procurados de Portugal, adaptadas a clientes nacionais e internacionais.";
  } else if (lang === "ES") {
    title = "Inversiones Inmobiliarias de Alto Valor";
    subtitle =
      "Oportunidades seleccionadas en los sectores más demandados de Portugal, adaptadas a clientes nacionales e internacionales.";
  } else if (lang === "FR") {
    title = "Investissements Immobiliers de Haute Valeur";
    subtitle =
      "Des opportunités sélectionnées dans les secteurs les plus recherchés du Portugal, adaptées aux clients nationaux et internationaux.";
  }

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 420, md: 520 },
        overflow: "hidden",
        bgcolor: "custom.navy",
      }}
    >
      {/* Background photograph */}
      <Box
        component="img"
        src={hero}
        alt=""
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 58%",
          display: "block",
        }}
      />
      {/* Flat navy veil — no gradient */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(18, 26, 38, 0.55)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          height: "100%",
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "30px", md: "48px" },
            lineHeight: { xs: 1.3, md: 1.15 },
            color: "custom.warmWhite",
            maxWidth: 760,
            letterSpacing: "0.005em",
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 2,
            bgcolor: "custom.champagne",
            my: { xs: "22px", md: "28px" },
          }}
        />
        <Typography
          component="p"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400,
            fontSize: { xs: "16px", md: "17px" },
            lineHeight: 1.75,
            color: "custom.warmWhite",
            opacity: 0.9,
            maxWidth: 620,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
