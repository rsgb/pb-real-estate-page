import { Box } from "@mui/material";
import Opportunities from "../assets/components/Opportunities";
import Header from "../assets/components/Header";
import About from "../assets/components/About";
import Services from "../assets/components/Services";
import KnowledgeCentreTeaser from "../assets/components/KnowledgeCentreTeaser";
import Partners from "../assets/components/Partners";
import Contact from "../assets/components/Contact";
import aboutphoto from "../assets/images/fotonb.png";
import { useLang, URL_LANGS } from "../assets/components/LangContext";
import { useHead, SITE_ORIGIN } from "../lib/head.jsx";

const META = {
  pt: {
    title: "Paulo Braga Real Estate | Investimento imobiliário em Portugal",
    description:
      "Oportunidades de investimento imobiliário selecionadas em Portugal - hotelaria, senior living, lazer e entretenimento - para clientes nacionais e internacionais.",
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

  // Header height (90 / 104) + 16; mirrors the CSS in src/index.css.
  const scrollMarginTop = { xs: 106, md: 120 };

  return (
    <Box component="main" sx={{ bgcolor: "background.default" }}>
      <Box id="home" sx={{ scrollMarginTop }}>
        <Header />
      </Box>
      <Box id="opportunities" sx={{ scrollMarginTop }}>
        <Opportunities />
      </Box>
      <Box id="services" sx={{ scrollMarginTop }}>
        <Services />
      </Box>
      <Box id="about" sx={{ scrollMarginTop }}>
        <About image={aboutphoto} alt="Paulo Braga" />
      </Box>
      <KnowledgeCentreTeaser />
      <Box id="partners" sx={{ scrollMarginTop }}>
        <Partners />
      </Box>
      <Box id="contact" sx={{ scrollMarginTop }}>
        <Contact />
      </Box>
    </Box>
  );
}
