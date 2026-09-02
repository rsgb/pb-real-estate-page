import { useLang } from "./LangContext";
import React from "react";
import hotels from "../images/hotels.jpg";
import seniorliving from "../images/seniorliving.jpg";
import entertainment from "../images/entertainment.jpg";

import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";

const data = [
  {
    img: hotels,
    title: "",
    description: "",
  },
  {
    img: entertainment,
    title: "",
    description: "",
  },
  {
    img: seniorliving,
    title: "",
    description: "",
  },
];

export default function ThreeCards() {
  const { lang } = useLang();

  if (lang === "EN") {
    data[0].title = "Hotels";
    data[0].description =
      "3 to 5-star units, operating or with approved projects, in major cities and tourist destinations in Portugal. Available with or without operator. Ideal for hotel investors or property funds.";
    data[1].title = "Leisure & Entertainment";
    data[1].description =
      "Properties with high income potential and appreciation. Ideal for restaurants, nightlife, events, or culture. Available with licenses, leased operations, or land with conversion potential.";
    data[2].title = "Senior Living / Health";
    data[2].description =
      "Land with approved projects or operational assets for assisted living, senior tourism, or health care. Strong international demand from insurers, funds, and specialized operators.";
  } else if (lang === "PT") {
    data[0].title = "Unidades Hoteleiras";
    data[0].description =
      "Ativos de 3 a 5 estrelas, em operação ou com projeto aprovado, localizados nas principais cidades e destinos turísticos de Portugal. Possibilidade de aquisição com ou sem operador. Ideal para investidores hoteleiros ou fundos imobiliários.";
    data[1].title = "Espaços de Lazer e Entretenimento";
    data[1].description =
      "Imóveis com elevado potencial de rendimento e valorização. Ideais para atividades de restauração, nightlife, eventos ou cultura. Soluções com licenciamento, operação arrendada ou terrenos com viabilidade de reconversão.";
    data[2].title = "Residências Séniores / Saúde";
    data[2].description =
      "Terrenos com projeto aprovado ou ativos operacionais para residência assistida, cuidados continuados ou turismo sénior. Crescente procura internacional por parte de seguradoras, fundos e operadores especializados.";
  } else if (lang === "ES") {
    data[0].title = "Unidades Hoteleras";
    data[0].description =
      "Activos de 3 a 5 estrellas, en funcionamiento o con proyecto aprobado, ubicados en las principales ciudades y destinos turísticos de Portugal. Posibilidad de compra con o sin operador. Ideal para inversores hoteleros o fondos inmobiliarios.";
    data[1].title = "Espacios de Ocio y Entretenimiento";
    data[1].description =
      "Inmuebles con alto potencial de rentabilidad y valorización. Ideales para restauración, vida nocturna, eventos o cultura. Soluciones con licencia, operación arrendada o terrenos con viabilidad de reconversión.";
    data[2].title = "Residencias Para Mayores / Salud";
    data[2].description =
      "Terrenos con proyecto aprobado o activos operativos para residencia asistida, cuidados continuados o turismo sénior. Creciente demanda internacional por parte de aseguradoras, fondos y operadores especializados.";
  } else if (lang === "FR") {
    data[0].title = "Unités Hôtelières";
    data[0].description =
      "Actifs 3 à 5 étoiles, en activité ou avec projet approuvé, situés dans les principales villes et destinations touristiques du Portugal. Acquisition possible avec ou sans opérateur. Idéal pour investisseurs hôteliers ou fonds immobiliers.";
    data[1].title = "Espaces de Loisirs et Divertissement";
    data[1].description =
      "Biens immobiliers à fort potentiel de rentabilité et de valorisation. Idéal pour des activités de restauration, nightlife, événements ou culture. Solutions avec licence, exploitation en location ou terrains à reconvertir.";
    data[2].title = "Résidences Seniors / Santé";
    data[2].description =
      "Terrains avec projet approuvé ou actifs en exploitation pour résidence assistée, soins prolongés ou tourisme senior. Demande croissante d’assureurs, fonds et opérateurs spécialisés.";
  }

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box
        sx={{
          width: "100%",
          mx: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          px: "10px",
          mb: { xs: 4, md: 10 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 6,
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {data.map(({ img, title, description }) => (
            <Card
              key={title}
              elevation={3}
              sx={{
                width: "350px",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardActionArea
                disableRipple
                disableTouchRipple
                sx={{ cursor: "default", "&:hover": { cursor: "default" } }}
              >
                <CardMedia
                  component="img"
                  image={img}
                  alt={title}
                  height={400}
                />
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: "'Libre Baskerville', serif" }}
                    gutterBottom
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: { xs: "1rem", md: "1rem" },
                      mb: 2,
                    }}
                    color="text.secondary"
                  >
                    {description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
