import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useLang } from "../assets/components/LangContext";
import { useHead } from "../lib/head.jsx";

export default function NotFound() {
  const { urlLang } = useLang();

  useHead({
    title: "Página não encontrada | Page not found",
    description: "Página não encontrada. / Page not found.",
    lang: urlLang,
    robots: "noindex",
  });

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 720,
        mx: "auto",
        px: 3,
        py: { xs: 10, md: 16 },
        textAlign: "center",
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, mb: 2 }}
      >
        404
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Não encontrámos esta página. Talvez o endereço esteja incorrecto.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        We couldn&rsquo;t find this page. The address may be incorrect.
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button component={RouterLink} to="/pt/" variant="outlined">
          Início (PT)
        </Button>
        <Button component={RouterLink} to="/en/" variant="outlined">
          Home (EN)
        </Button>
      </Box>
    </Box>
  );
}
