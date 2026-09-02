import { useLang } from "./LangContext";
import * as React from "react";
import { Link as RouterLink } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PBre from "../images/PBre black.png";

const languages = ["PT", "EN", "ES", "FR"];
// Map language codes to flag emojis
const flagMap = {
  PT: "🇵🇹",
  EN: "🇬🇧",
  ES: "🇪🇸",
  FR: "🇫🇷",
};

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElLang, setAnchorElLang] = React.useState(null);
  const [anchorElMobileLang, setAnchorElMobileLang] = React.useState(null);
  const { lang, urlLang, setLang } = useLang();

  const pageKeys = ["home", "services", "about", "partners", "contact"];
  const pageLabels = {
    EN: ["Home", "Services", "About", "Partners", "Contact"],
    PT: ["Início", "Serviços", "Sobre Mim", "Parceiros", "Contacto"],
    ES: ["Inicio", "Servicios", "Sobre Mí", "Parceiros", "Contacto"],
    FR: ["Accueil", "Services", "À Propos", "Partenaires", "Contact"],
  };
  const pages = [
    ...pageKeys.map((key, idx) => ({
      id: key,
      label: (pageLabels[lang] || pageLabels.EN)[idx] || pageLabels.EN[idx],
      to: `/${urlLang}/#${key}`,
    })),
    // Same label in all four languages (Paulo's decision).
    {
      id: "knowledge-centre",
      label: "Knowledge Centre",
      to: `/${urlLang}/knowledge-centre/`,
    },
  ];

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const handleOpenLangMenu = (e) => setAnchorElLang(e.currentTarget);
  const handleCloseLangMenu = () => setAnchorElLang(null);

  const handleOpenMobileLangMenu = (e) =>
    setAnchorElMobileLang(e.currentTarget);
  const handleCloseMobileLangMenu = () => setAnchorElMobileLang(null);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.custom.champagneHairline}`,
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          maxWidth: { xs: "350px", md: "748px", lg: "1148px" },
          width: "100%",
          mx: "auto",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 140,
          }}
        >
          {/* Logo / Title */}
          <Box
            component={RouterLink}
            to={`/${urlLang}/`}
            aria-label="Paulo Braga Real Estate"
            sx={{
              display: "flex",
              alignContent: "flex-start",
            }}
          >
            <img
              src={PBre}
              alt="Paulo Braga Real Estate Logo"
              style={{ height: 80 }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Mobile menu button */}
            <Box sx={{ display: { xs: "flex", lg: "none" }, gap: 1 }}>
              <IconButton
                size="large"
                color="inherit"
                aria-label="open navigation menu"
                onClick={handleOpenNavMenu}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                size="large"
                color="inherit"
                aria-label="open language menu"
                onClick={handleOpenMobileLangMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  transition: "opacity 0.2s, transform 0.2s",
                  cursor: "pointer",
                  ...(Boolean(anchorElMobileLang) && {
                    opacity: 0.9,
                    transform: "scale(0.95)",
                  }),
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: "0.875rem",
                  }}
                >
                  {flagMap[lang]}
                </Typography>
                <ArrowDropDownIcon />
              </IconButton>
            </Box>
            {/* Desktop links */}
            <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 4 }}>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  component={RouterLink}
                  to={page.to}
                  onClick={handleCloseNavMenu}
                  sx={{ color: "inherit", display: "block" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "0.875rem",
                    }}
                  >
                    {page.label}
                  </Typography>
                </Button>
              ))}
            </Box>
            {/* Desktop language switch */}
            <Button
              onClick={handleOpenLangMenu}
              disableRipple
              sx={{
                color: "inherit",
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.5,
                cursor: "default",
                transition: "opacity 0.2s, transform 0.2s",
                ...(Boolean(anchorElLang) && {
                  opacity: 0.9,
                  transform: "scale(0.95)",
                }),
                "&:hover": {
                  // Keep existing hover styles if any (none specified here)
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: "0.875rem",
                }}
              >
                {flagMap[lang]}
              </Typography>
              <ArrowDropDownIcon />
            </Button>
          </Box>
          <Menu
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            {pages.map((page) => (
              <MenuItem
                component={RouterLink}
                to={page.to}
                key={page.id}
                onClick={handleCloseNavMenu}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: "0.875rem",
                  }}
                >
                  {page.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>

          {/* Mobile Language Menu */}
          <Menu
            anchorEl={anchorElMobileLang}
            open={Boolean(anchorElMobileLang)}
            onClose={handleCloseMobileLangMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {languages.map((lng) => (
              <MenuItem
                key={lng}
                selected={lng === lang}
                onClick={() => {
                  setLang(lng);
                  handleCloseMobileLangMenu();
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: "0.875rem",
                  }}
                >
                  {flagMap[lng]}
                </Typography>
              </MenuItem>
            ))}
          </Menu>

          <Menu
            anchorEl={anchorElLang}
            open={Boolean(anchorElLang)}
            onClose={handleCloseLangMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {languages.map((lng) => (
              <MenuItem
                key={lng}
                selected={lng === lang}
                onClick={() => {
                  setLang(lng);
                  handleCloseLangMenu();
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: "0.875rem",
                  }}
                >
                  {flagMap[lng]}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
