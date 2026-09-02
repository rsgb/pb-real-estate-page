import { Box } from "@mui/material";
import Opportunities from "../assets/components/Opportunities";
import Header from "../assets/components/Header";
import About from "../assets/components/About";
import Services from "../assets/components/Services";
import Partners from "../assets/components/Partners";
import Contact from "../assets/components/Contact";
import aboutphoto from "../assets/images/fotonb.png";
import { useLang, URL_LANGS } from "../assets/components/LangContext";
import { useHead, SITE_ORIGIN } from "../lib/head.jsx";

const META = {
  pt: {
    title: "Paulo Braga Real Estate | Investimento imobiliário em Portugal",
    description:
      "Oportunidades de investimento imobiliário seleccionadas em Portugal - hotelaria, senior living, lazer e entretenimento - para clientes nacionais e internacionais.",
  },
  en: {
    title: "Paulo Braga Real Estate | Property investment in Portugal",
    description:
      "Curated real estate investment opportunities in Portugal - hospitality, senior living, leisure and entertainment - for national and international clients.",
  },
  es: {
    title: "Paulo Braga Real Estate | Inversión inmobiliaria en Portugal",
    description:
      "Oportunidades de inversión inmobiliaria seleccionadas en Portugal - hotelería, senior living, ocio y entretenimiento - para clientes nacionales e internacionales.",
  },
  fr: {
    title: "Paulo Braga Real Estate | Investissement immobilier au Portugal",
    description:
      "Des opportunités d'investissement immobilier sélectionnées au Portugal - hôtellerie, senior living, loisirs et divertissement - pour une clientèle nationale et internationale.",
  },
};

export default function Home() {
  const { urlLang } = useLang();
  const meta = META[urlLang] ?? META.pt;

  useHead({
    title: meta.title,
    description: meta.description,
    lang: urlLang,
    canonical: `${SITE_ORIGIN}/${urlLang}/`,
    alternates: [
      ...URL_LANGS.map((code) => ({ lang: code, href: `${SITE_ORIGIN}/${code}/` })),
      { lang: "x-default", href: `${SITE_ORIGIN}/pt/` },
    ],
    og: { title: meta.title, description: meta.description, type: "website" },
  });

  return (
    <>
      <Box id="home" sx={{ scrollMarginTop: { xs: 120, md: 160 } }}>
        <Header />
      </Box>
      <div>
        <Opportunities />
      </div>
      <Box id="services">
        <Services />
      </Box>
      <Box id="about" sx={{ scrollMarginTop: { xs: 120, md: 160 } }}>
        <About image={aboutphoto} buttonText="Contact Me" />
      </Box>
      <Box
        sx={{
          background: () => `linear-gradient(180deg, #f7f5f0 0%, transparent 60%)`,
        }}
      >
        <Box id="partners" sx={{ scrollMarginTop: { xs: 120, md: 160 } }}>
          <Partners />
        </Box>
        <Box
          sx={{
            height: "1px",
            maxWidth: 920,
            mx: "auto",
            my: { xs: 6, md: 8 },
            bgcolor: (theme) => theme.palette.custom.champagneHairline,
            borderRadius: 1,
          }}
        />
        <Box id="contact" sx={{ scrollMarginTop: { xs: 120, md: 160 } }}>
          <Contact />
        </Box>
      </Box>
    </>
  );
}
