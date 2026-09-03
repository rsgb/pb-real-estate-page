import { Box, Typography } from "@mui/material";
import { useLang } from "./LangContext";

const COPY = {
  EN: [
    "About",
    "I’m Paulo Braga, a real estate consultant focused on the acquisition and sale of strategic assets, with emphasis on the hotel, leisure, and senior residence sectors.",
    "With over 30 years of experience in management, consulting, project development, team leadership, and distribution networks in the private sector, I bring a broad perspective on negotiation, partnerships, and asset appreciation.",
    "I work in collaboration with national and international investors and multidisciplinary teams, ensuring discretion, precision, and tailored solutions for each context.",
  ],
  PT: [
    "Sobre Mim",
    "Sou Paulo Braga, consultor imobiliário com um percurso consolidado no apoio à compra e venda de ativos estratégicos, com foco nos setores da hotelaria, lazer noturno e residências seniores.",
    "A minha experiência resulta de mais de 30 anos em cargos de gestão, assessoria, desenvolvimento de projetos, gestão de equipas e de redes de distribuição no setor privado, onde desenvolvi uma visão abrangente sobre negociação, parcerias e valorização de ativos.",
    "Trabalho em articulação com investidores nacionais e internacionais, e com equipas multidisciplinares, garantindo discrição, rigor e soluções ajustadas a cada contexto.",
  ],
  ES: [
    "Sobre Mí",
    "Soy Paulo Braga, consultor inmobiliario con una sólida trayectoria en la compra y venta de activos estratégicos, centrado en los sectores hotelero, ocio nocturno y residencias para mayores.",
    "Mi experiencia proviene de más de 30 años en cargos directivos, asesoría, desarrollo de proyectos, gestión de equipos y redes comerciales en el sector privado, lo que me ha proporcionado una visión integral sobre negociación, asociaciones y valorización de activos.",
    "Trabajo con inversores nacionales e internacionales, y con equipos multidisciplinares, garantizando discreción, rigor y soluciones adaptadas a cada contexto.",
  ],
  FR: [
    "À Propos",
    "Je suis Paulo Braga, consultant immobilier avec une solide expérience dans l'achat et la vente d'actifs stratégiques, notamment dans les secteurs de l’hôtellerie, des loisirs nocturnes et des résidences seniors.",
    "Mon parcours inclut plus de 30 ans à des postes de direction, de conseil, de développement de projets, de gestion d’équipes et de réseaux de distribution dans le secteur privé, me conférant une vision globale de la négociation, des partenariats et de la valorisation d’actifs.",
    "Je travaille en collaboration avec des investisseurs nationaux et internationaux ainsi qu’avec des équipes pluridisciplinaires, garantissant discrétion, rigueur et solutions sur mesure.",
  ],
};

export default function About({ image, alt }) {
  const { lang } = useLang();
  const [heading, ...paragraphs] = COPY[lang] ?? COPY.PT;

  return (
    <Box
      component="section"
      sx={(theme) => ({
        backgroundColor: theme.palette.custom.aboutBand,
        borderTop: `1px solid ${theme.palette.custom.hairline}`,
        borderBottom: `1px solid ${theme.palette.custom.hairline}`,
        py: { xs: 6, md: 10 },
      })}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1146,
          mx: "auto",
          px: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "420px minmax(0, 1fr)" },
          gap: { xs: 5, md: 10 },
          alignItems: "start",
        }}
      >
        {/* Portrait on a white plate, inside the offset champagne frame */}
        <Box
          sx={(theme) => ({
            position: "relative",
            ml: { xs: "10px", md: "14px" },
            mr: { xs: "10px", md: 0 },
            "&::before": {
              content: '""',
              position: "absolute",
              left: { xs: -10, md: -14 },
              top: { xs: -10, md: -14 },
              right: { xs: 10, md: 14 },
              bottom: { xs: 10, md: 14 },
              border: `1px solid ${theme.palette.custom.champagneFrame}`,
            },
          })}
        >
          <Box
            sx={(theme) => ({
              position: "relative",
              zIndex: 1,
              backgroundColor: "#ffffff",
              border: `1px solid ${theme.palette.custom.hairline}`,
              p: "20px",
              pb: "16px",
            })}
          >
            <Box
              component="img"
              src={image}
              alt={alt || "Paulo Braga"}
              sx={{ display: "block", width: "100%", height: "auto" }}
            />
          </Box>
        </Box>

        {/* Text */}
        <Box sx={{ pt: { xs: 3, md: "14px" } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: "28px", md: "34px" },
              lineHeight: 1.2,
              color: "custom.navy",
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
              mb: { xs: "26px", md: "30px" },
            }}
          />
          {paragraphs.map((paragraph) => (
            <Typography
              key={paragraph.slice(0, 24)}
              component="p"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "16px",
                lineHeight: 1.75,
                color: "custom.bodyText",
                textAlign: "left",
                maxWidth: 600,
                "&:not(:last-of-type)": { mb: { xs: "18px", md: "20px" } },
              }}
            >
              {paragraph}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
