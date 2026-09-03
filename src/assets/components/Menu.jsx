import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useLang } from "./LangContext";
import { BurgerIcon } from "./icons.jsx";
import PBre from "../images/PBre black.png";

const languages = ["PT", "EN", "ES", "FR"];

/**
 * Header height. The section scroll-margins in src/index.css follow it (+16),
 * as do the `scrollMarginTop` values in src/pages/Home.jsx.
 */
const HEADER_HEIGHT = { xs: 90, md: 104 };

const navType = {
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 600,
  fontSize: "12.5px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  lineHeight: 1,
};

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { lang, urlLang, setLang } = useLang();
  const { pathname, hash } = useLocation();

  const pageKeys = ["home", "services", "about", "partners", "contact"];
  const pageLabels = {
    EN: ["Home", "Services", "About", "Partners", "Contact"],
    PT: ["Início", "Serviços", "Sobre Mim", "Parceiros", "Contacto"],
    ES: ["Inicio", "Servicios", "Sobre Mí", "Parceiros", "Contacto"],
    FR: ["Accueil", "Services", "À Propos", "Partenaires", "Contact"],
  };
  const sections = pageKeys.map((key, idx) => ({
    id: key,
    label: (pageLabels[lang] || pageLabels.EN)[idx] || pageLabels.EN[idx],
    to: `/${urlLang}/#${key}`,
  }));
  // Knowledge Centre sits between Parceiros and Contacto, as in the mockup.
  // Same label in all four languages (Paulo's decision).
  const pages = [
    ...sections.slice(0, 4),
    {
      id: "knowledge-centre",
      label: "Knowledge Centre",
      to: `/${urlLang}/knowledge-centre/`,
    },
    ...sections.slice(4),
  ];

  // Which item wears the champagne underline. Derived from the URL only, so it
  // is identical in the pre-rendered markup and after hydration.
  const inKnowledgeCentre = pathname.includes("/knowledge-centre");
  const currentId = inKnowledgeCentre
    ? "knowledge-centre"
    : (hash ? hash.slice(1) : "home");

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const focusRing = (theme) => ({
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.custom.champagne}`,
      outlineOffset: 3,
    },
  });

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        top: 0,
        backgroundColor: "background.default",
        backgroundImage: "none",
        borderBottom: (theme) => `1px solid ${theme.palette.custom.hairline}`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1146,
          mx: "auto",
          px: 3,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: HEADER_HEIGHT.xs - 1, md: HEADER_HEIGHT.md - 1 },
            height: { xs: HEADER_HEIGHT.xs - 1, md: HEADER_HEIGHT.md - 1 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Wordmark */}
          <Box
            component={RouterLink}
            to={`/${urlLang}/`}
            aria-label="Paulo Braga Real Estate"
            sx={[{ display: "flex", alignItems: "center", flex: "none" }, focusRing]}
          >
            <Box
              component="img"
              src={PBre}
              alt="Paulo Braga Real Estate"
              sx={{
                display: "block",
                width: { xs: 118, md: 150 },
                height: "auto",
              }}
            />
          </Box>

          {/* Phone: burger only (the four language codes live inside it) */}
          <Box sx={{ display: { xs: "flex", lg: "none" } }}>
            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorElNav)}
              onClick={handleOpenNavMenu}
              sx={[
                {
                  width: 46,
                  height: 46,
                  borderRadius: 0,
                  color: "custom.navy",
                },
                focusRing,
              ]}
            >
              <BurgerIcon />
            </IconButton>
          </Box>

          {/* Desktop: links + language codes */}
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              gap: "38px",
            }}
          >
            <Box component="nav" sx={{ display: "flex", alignItems: "center", gap: "28px" }}>
              {pages.map((page) => {
                const active = page.id === currentId;
                return (
                  <Box
                    key={page.id}
                    component={RouterLink}
                    to={page.to}
                    aria-current={active ? "page" : undefined}
                    sx={[
                      (theme) => ({
                        ...navType,
                        color: theme.palette.custom.navy,
                        textDecoration: "none",
                        pb: "5px",
                        borderBottom: `2px solid ${
                          active ? theme.palette.custom.champagne : "transparent"
                        }`,
                        "&:hover": { color: theme.palette.custom.burgundy },
                      }),
                      focusRing,
                    ]}
                  >
                    {page.label}
                  </Box>
                );
              })}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                pl: "34px",
                borderLeft: (theme) => `1px solid ${theme.palette.custom.hairline}`,
              }}
            >
              {languages.map((code) => {
                const current = code === lang;
                return (
                  <Box
                    key={code}
                    component="button"
                    type="button"
                    lang={code.toLowerCase()}
                    onClick={() => setLang(code)}
                    aria-current={current ? "true" : undefined}
                    sx={[
                      (theme) => ({
                        border: 0,
                        background: "none",
                        p: "4px 2px",
                        cursor: "pointer",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "11.5px",
                        letterSpacing: "0.10em",
                        fontWeight: current ? 600 : 400,
                        color: current
                          ? theme.palette.custom.navy
                          : theme.palette.custom.textMuted,
                        "&:hover": { color: theme.palette.custom.navy },
                      }),
                      focusRing,
                    ]}
                  >
                    {code}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Toolbar>
      </Box>

      {/* Phone navigation */}
      <Menu
        anchorEl={anchorElNav}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              mt: 1,
              minWidth: 232,
              borderRadius: 0,
              border: `1px solid ${theme.palette.custom.hairline}`,
              boxShadow: "none",
            }),
          },
        }}
      >
        {pages.map((page) => (
          <MenuItem
            component={RouterLink}
            to={page.to}
            key={page.id}
            onClick={handleCloseNavMenu}
            selected={page.id === currentId}
            sx={(theme) => ({
              minHeight: 48,
              ...navType,
              py: 1.5,
              borderLeft: "2px solid transparent",
              "&.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: "transparent",
                borderLeftColor: theme.palette.custom.champagne,
              },
            })}
          >
            {page.label}
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", px: 1, pb: 0.5 }}>
          {languages.map((code) => (
            <MenuItem
              key={code}
              lang={code.toLowerCase()}
              selected={code === lang}
              onClick={() => {
                setLang(code);
                handleCloseNavMenu();
              }}
              sx={(theme) => ({
                minWidth: 46,
                minHeight: 46,
                justifyContent: "center",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12.5px",
                letterSpacing: "0.10em",
                fontWeight: code === lang ? 600 : 400,
                color:
                  code === lang
                    ? theme.palette.custom.navy
                    : theme.palette.custom.textMuted,
                borderBottom: "2px solid transparent",
                "&.Mui-selected, &.Mui-selected:hover": {
                  backgroundColor: "transparent",
                  borderBottomColor: theme.palette.custom.champagne,
                },
              })}
            >
              {code}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </AppBar>
  );
}
