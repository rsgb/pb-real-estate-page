import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import {
  LangProvider,
  URL_LANGS,
  preferredLang,
} from "./assets/components/LangContext";
import ResponsiveAppBar from "./assets/components/Menu";
import Footer from "./assets/components/Footer";
import Analytics from "./assets/components/Analytics";
import ScrollToHash from "./assets/components/ScrollToHash";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { KnowledgeCentreRoutes, thbTheme } from "./knowledge-centre/index.jsx";

/** "/" -> client-side redirect to the visitor's preferred language. */
function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/${preferredLang()}/`, { replace: true });
  }, [navigate]);

  // Pre-rendered/no-JS fallback: the static "/" page is a meta-refresh to /pt.
  return null;
}

/** Guards the `:lang` segment; unknown codes fall through to the 404 page. */
function LangLayout() {
  const { lang } = useParams();
  if (!URL_LANGS.includes(String(lang).toLowerCase())) return <NotFound />;
  if (lang !== lang.toLowerCase()) {
    return <Navigate to={`/${lang.toLowerCase()}/`} replace />;
  }
  return <Outlet />;
}

function KnowledgeCentre() {
  return (
    <ThemeProvider theme={thbTheme}>
      {/* The header is sticky and the footer follows the content, so the ivory
          band simply runs from one to the other — no offset hack needed. */}
      <Box sx={{ bgcolor: "background.default", pb: { xs: 8, md: 12 } }}>
        <KnowledgeCentreRoutes />
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <LangProvider>
      <Analytics />
      <ScrollToHash />
      <ResponsiveAppBar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path="market-brief/*" element={<KnowledgeCentre />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </LangProvider>
  );
}

export default App;
