import { Box, Paper, Typography } from "@mui/material";
import { useLang } from "./LangContext";
import hotelsCard from "../images/hotels-card.jpg";
import leisure from "../images/leisure.jpg";
import seniorGolf from "../images/senior-golf.jpg";

/** Photo, and how it should be framed in the card window. */
const CARDS = [
  // D-17: hotel lobby chosen by Paulo (the hero keeps the room photo).
  { img: hotelsCard, objectPosition: "center 40%" },
  // D-17: the leisure card uses the concert photograph.
  { img: leisure, objectPosition: "center 45%" },
  // 2026-09-06: an older man in white golf kit addressing the ball (Pexels,
  // Safari Consoler), chosen by Paulo: the upper-class active-retirement register
  // his senior-living investors use. Cropped from a portrait frame.
  { img: seniorGolf, objectPosition: "center 35%" },
];

const COPY = {
  EN: [
    [
      "Hotels",
      "3 to 5-star units, operating or with approved projects, in major cities and tourist destinations in Portugal. Available with or without operator. Ideal for hotel investors or property funds.",
    ],
    [
      "Leisure & Entertainment",
      "Properties with high income potential and appreciation. Ideal for restaurants, nightlife, events, or culture. Available with licenses, leased operations, or land with conversion potential.",
    ],
    [
      "Senior Living / Health",
      "Land with approved projects or operational assets for assisted living, senior tourism, or health care. Strong international demand from insurers, funds, and specialized operators.",
    ],
  ],
  PT: [
    [
      "Unidades Hoteleiras",
      "Ativos de 3 a 5 estrelas, em operação ou com projeto aprovado, localizados nas principais cidades e destinos turísticos de Portugal. Possibilidade de aquisição com ou sem operador. Ideal para investidores hoteleiros ou fundos imobiliários.",
    ],
    [
      "Espaços de Lazer e Entretenimento",
      "Imóveis com elevado potencial de rendimento e valorização. Ideais para atividades de restauração, nightlife, eventos ou cultura. Soluções com licenciamento, operação arrendada ou terrenos com viabilidade de reconversão.",
    ],
    [
      "Residências Séniores / Saúde",
      "Terrenos com projeto aprovado ou ativos operacionais para residência assistida, cuidados continuados ou turismo sénior. Crescente procura internacional por parte de seguradoras, fundos e operadores especializados.",
    ],
  ],
  ES: [
    [
      "Unidades Hoteleras",
      "Activos de 3 a 5 estrellas, en funcionamiento o con proyecto aprobado, ubicados en las principales ciudades y destinos turísticos de Portugal. Posibilidad de compra con o sin operador. Ideal para inversores hoteleros o fondos inmobiliarios.",
    ],
    [
      "Espacios de Ocio y Entretenimiento",
      "Inmuebles con alto potencial de rentabilidad y valorización. Ideales para restauración, vida nocturna, eventos o cultura. Soluciones con licencia, operación arrendada o terrenos con viabilidad de reconversión.",
    ],
    [
      "Residencias Para Mayores / Salud",
      "Terrenos con proyecto aprobado o activos operativos para residencia asistida, cuidados continuados o turismo sénior. Creciente demanda internacional por parte de aseguradoras, fondos y operadores especializados.",
    ],
  ],
  FR: [
    [
      "Unités Hôtelières",
      "Actifs 3 à 5 étoiles, en activité ou avec projet approuvé, situés dans les principales villes et destinations touristiques du Portugal. Acquisition possible avec ou sans opérateur. Idéal pour investisseurs hôteliers ou fonds immobiliers.",
    ],
    [
      "Espaces de Loisirs et Divertissement",
      "Biens immobiliers à fort potentiel de rentabilité et de valorisation. Idéal pour des activités de restauration, nightlife, événements ou culture. Solutions avec licence, exploitation en location ou terrains à reconvertir.",
    ],
    [
      "Résidences Seniors / Santé",
      "Terrains avec projet approuvé ou actifs en exploitation pour résidence assistée, soins prolongés ou tourisme senior. Demande croissante d’assureurs, fonds et opérateurs spécialisés.",
    ],
  ],
};

/** Section title, the one word the hero's scroll cue leads to. */
const HEADING = { PT: "Oportunidades", EN: "Opportunities", ES: "Oportunidades", FR: "Opportunités" };

export default function ThreeCards() {
  const { lang } = useLang();
  const copy = COPY[lang] ?? COPY.PT;
  const heading = HEADING[lang] ?? HEADING.PT;

  return (
    <Box
      component="section"
      aria-labelledby="opportunities-title"
      sx={{ bgcolor: "background.default", py: { xs: 6, md: 11 } }}
    >
      {/* Heading + rule, as in Services: a quiet band between the hero and
          the three photos, so the images start further down the page. */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 3,
          mb: { xs: "34px", md: "54px" },
        }}
      >
        <Typography
          id="opportunities-title"
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

      <Box
        sx={{
          width: "100%",
          maxWidth: 1146,
          mx: "auto",
          px: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 4.5, md: 4 },
          alignItems: "start",
        }}
      >
        {CARDS.map(({ img, objectPosition }, index) => {
          const [title, description] = copy[index];
          return (
            <Paper
              key={title}
              component="article"
              elevation={0}
              sx={(theme) => ({
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.custom.champagneHairline}`,
                p: { xs: "18px 18px 28px", md: "20px 20px 32px" },
              })}
            >
              {/* Photo, with the champagne frame offset behind it */}
              <Box
                sx={(theme) => ({
                  position: "relative",
                  mb: { xs: "28px", md: "30px" },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: { xs: 9, md: 10 },
                    top: { xs: 9, md: 10 },
                    right: { xs: -9, md: -10 },
                    bottom: { xs: -9, md: -10 },
                    border: `1px solid ${theme.palette.custom.champagneFrame}`,
                  },
                })}
              >
                <Box
                  component="img"
                  src={img}
                  alt={title}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "block",
                    width: "100%",
                    height: { xs: 206, md: 232 },
                    objectFit: "cover",
                    objectPosition,
                  }}
                />
              </Box>

              <Box sx={{ px: { xs: "10px", md: "8px" } }}>
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{
                    fontSize: { xs: "20px", md: "22px" },
                    lineHeight: 1.35,
                    color: "custom.navy",
                  }}
                >
                  {title}
                </Typography>
                <Box
                  sx={(theme) => ({
                    height: "1px",
                    my: 2,
                    bgcolor: theme.palette.custom.champagneHairline,
                  })}
                />
                <Typography
                  component="p"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: { xs: "16px", md: "15px" },
                    lineHeight: 1.72,
                    color: "custom.textMuted",
                  }}
                >
                  {description}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
