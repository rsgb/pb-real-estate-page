import { useLang } from "./LangContext";
import { Box, CardMedia, Typography } from "@mui/material";

export default function About({ image, alt }) {
  const { lang } = useLang();
  let about = [];

  if (lang === "EN") {
    about = [
      "About",
      "I’m Paulo Braga, a real estate consultant focused on the acquisition and sale of strategic assets, with emphasis on the hotel, leisure, and senior residence sectors.",
      "With over 30 years of experience in management, consulting, project development, team leadership, and distribution networks in the private sector, I bring a broad perspective on negotiation, partnerships, and asset appreciation.",
      "I work in collaboration with national and international investors and multidisciplinary teams, ensuring discretion, precision, and tailored solutions for each context.",
    ];
  } else if (lang === "PT") {
    about = [
      "Sobre Mim",
      "Sou Paulo Braga, consultor imobiliário com um percurso consolidado no apoio à compra e venda de ativos estratégicos, com foco nos setores da hotelaria, lazer noturno e residências seniores.",
      "A minha experiência resulta de mais de 30 anos em cargos de gestão, assessoria, desenvolvimento de projetos, gestão de equipas e de redes de distribuição no setor privado, onde desenvolvi uma visão abrangente sobre negociação, parcerias e valorização de ativos.",
      "Trabalho em articulação com investidores nacionais e internacionais, e com equipas multidisciplinares, garantindo discrição, rigor e soluções ajustadas a cada contexto.",
    ];
  } else if (lang === "ES") {
    about = [
      "Sobre Mí",
      "Soy Paulo Braga, consultor inmobiliario con una sólida trayectoria en la compra y venta de activos estratégicos, centrado en los sectores hotelero, ocio nocturno y residencias para mayores.",
      "Mi experiencia proviene de más de 30 años en cargos directivos, asesoría, desarrollo de proyectos, gestión de equipos y redes comerciales en el sector privado, lo que me ha proporcionado una visión integral sobre negociación, asociaciones y valorización de activos.",
      "Trabajo con inversores nacionales e internacionales, y con equipos multidisciplinares, garantizando discreción, rigor y soluciones adaptadas a cada contexto.",
    ];
  } else if (lang === "FR") {
    about = [
      "À Propos",
      "Je suis Paulo Braga, consultant immobilier avec une solide expérience dans l'achat et la vente d'actifs stratégiques, notamment dans les secteurs de l’hôtellerie, des loisirs nocturnes et des résidences seniors.",
      "Mon parcours inclut plus de 30 ans à des postes de direction, de conseil, de développement de projets, de gestion d’équipes et de réseaux de distribution dans le secteur privé, me conférant une vision globale de la négociation, des partenariats et de la valorisation d’actifs.",
      "Je travaille en collaboration avec des investisseurs nationaux et internationaux ainsi qu’avec des équipes pluridisciplinaires, garantissant discrétion, rigueur et solutions sur mesure.",
    ];
  }

  return (
    <>
      <Box className="parallax-background" sx={{ minHeight: "100%" }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "350px", md: "748px", lg: "1146px" },
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            mb: { xs: 4, md: 10 },
            mt: { xs: 12, md: 15 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gap: 0,
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)", // 1 column on extra-small
                md: "repeat(2, 1fr)", // 2 columns (2 rows for 4+ cards) on medium
              },
              gridAutoRows: "auto",
              justifyContent: "center",
              alignItems: "end",
            }}
          >
            {/* Left column: image*/}
            <Box sx={{ textAlign: "center" }}>
              <CardMedia
                component="img"
                image={image}
                alt={alt}
                sx={{
                  width: { xs: "350px", md: "100%" },
                  minWidth: "350px",
                  height: "400px",
                  objectFit: "cover",
                  objectPosition: "center 10%",
                }}
              />
            </Box>

            {/* Right column: text */}
            <Box
              sx={{
                width: "100%",
                minWidth: "350px",
                alignSelf: "center",
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                margin="20px"
                sx={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  textAlign: "left",
                  mb: 2,
                  mt: { xs: 5, md: 2 },
                  display: "inline-block",
                  borderBottom: (theme) => `2px solid ${theme.palette.custom.champagne}`,
                  pb: 0.75,
                }}
              >
                {about[0]}
              </Typography>
              <Typography
                margin="20px"
                variant="h2"
                component="div"
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "justify",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  color: "black",
                  fontWeight: 500,
                  fontSize: { xs: "1rem", md: "1rem" },
                }}
              >
                <p>{about[1]}</p>
                <p>{about[2]}</p>
                <p>{about[3]}</p>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
