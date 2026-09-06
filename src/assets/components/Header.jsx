import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useLang } from "./LangContext";
// 2026-09-06: hotel room in blue damask with two lit lamps (Pexels, Katrine
// Skrebele), chosen by Paulo: it says hotel without saying which kind of hotel.
import hero from "../images/hero-hotel-room.jpg";

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
      "Oportunidades selecionadas nos setores mais procurados de Portugal, adaptadas a clientes nacionais e internacionais.";
  } else if (lang === "ES") {
    title = "Inversiones Inmobiliarias de Alto Valor";
    subtitle =
      "Oportunidades seleccionadas en los sectores más demandados de Portugal, adaptadas a clientes nacionales e internacionales.";
  } else if (lang === "FR") {
    title = "Investissements Immobiliers de Haute Valeur";
    subtitle =
      "Des opportunités sélectionnées dans les secteurs les plus recherchés du Portugal, adaptées aux clients nationaux et internationaux.";
  }

  const cue = { EN: "Explore", ES: "Explorar", FR: "Explorer" }[lang] ?? "Explorar";

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        // The hero owns the first screen: viewport minus the 90 / 104 px bar,
        // never shorter than the old fixed band, never taller than 640 / 760
        // so a large monitor does not get a wall of photo. `svh` is the small
        // viewport, so phone browser chrome does not make the band jump; a
        // browser without it keeps the min-height.
        minHeight: { xs: 420, md: 520 },
        height: { xs: "calc(100svh - 90px)", md: "calc(100svh - 104px)" },
        maxHeight: { xs: 720, md: 760 },
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
          objectPosition: "center 50%",
          display: "block",
        }}
      />
      {/* Flat navy veil — no gradient. 0.7 rather than 0.55: the aerial is busy
          with white roofs, and the title needs a calmer ground. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          // Light enough to keep the room's colour (Paulo found 0.7 lifeless).
          backgroundColor: "rgba(18, 26, 38, 0.4)",
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
            maxWidth: 620,
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Scroll cue: label over a short champagne hairline, bottom centre.
          Echoes the rule under the title; the slow bob is switched off under
          prefers-reduced-motion (src/index.css). */}
      <Box
        component="a"
        href="#opportunities"
        className="hero-cue"
        sx={{
          position: "absolute",
          left: "50%",
          bottom: { xs: 18, md: 26 },
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "custom.warmWhite",
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: "11px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          lineHeight: 1,
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "custom.champagne",
            outlineOffset: 6,
          },
        }}
      >
        {cue}
        <Box
          component="span"
          aria-hidden="true"
          sx={{ display: "block", width: "1px", height: { xs: 28, md: 40 }, bgcolor: "custom.champagne" }}
        />
      </Box>
    </Box>
  );
}
