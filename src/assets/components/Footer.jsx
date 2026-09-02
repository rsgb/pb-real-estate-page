import { useLang } from "./LangContext";
import { Box, IconButton, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import logo from "../images/KWsol white.png";
import secondLogo from "../images/PBre white.png";

export default function Footer() {
  const { urlLang } = useLang();

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: (theme) => theme.palette.custom.footerBg,
        position: "relative",
        color: "#FFFFFF",
        minHeight: "500px",
        pt: { xs: "30px", md: 4 }, // 10px top padding on mobile
        pb: { xs: 2, md: 4 }, // keep original bottom padding
        px: { xs: 1, md: 6 },
        fontFamily: "'Montserrat', sans-serif",
        mt: 15,
        borderTop: (theme) =>
          `1px solid ${theme.palette.custom.champagneHairline}`,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "300px 1fr 1fr 1fr" },
          gridTemplateRows: "auto",
          alignItems: "start",
          gap: 4,
          transform: { md: "translateY(50px)" },
          paddingBottom: "30px",
          maxWidth: { xs: "320px", md: "100%" },
          mx: { xs: "auto", md: 0 },
        }}
      >
        {/* Row 1, Col 4: Contact Icons */}
        <Box
          sx={{
            gridColumn: { xs: 1, md: 4 },
            gridRow: { xs: 2, md: 1 },
            alignSelf: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-end" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <IconButton
              component={Link}
              href="tel:+351915312417"
              sx={{
                color: "#FFFFFF",
                transition: "transform 0.3s ease, opacity 0.3s ease",
                opacity: 0.8,
                "&:hover": {
                  transform: "scale(1.05)",
                  opacity: 1,
                },
              }}
            >
              <CallIcon />
            </IconButton>
            <IconButton
              component={Link}
              href="mailto:paulo.braga@kwportugal.pt"
              sx={{
                color: "#FFFFFF",
                transition: "transform 0.3s ease, opacity 0.3s ease",
                opacity: 0.8,
                "&:hover": {
                  transform: "scale(1.05)",
                  opacity: 1,
                },
              }}
            >
              <EmailIcon />
            </IconButton>
            <IconButton
              component={Link}
              href="https://wa.me/351915312417"
              sx={{
                color: "#FFFFFF",
                transition: "transform 0.3s ease, opacity 0.3s ease",
                opacity: 0.8,
                "&:hover": {
                  transform: "scale(1.05)",
                  opacity: 1,
                },
              }}
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              component={Link}
              href="https://www.linkedin.com/in/paulobragarealestateagentkwportugal/"
              target="_blank"
              rel="noopener"
              sx={{
                color: "#FFFFFF",
                transition: "transform 0.3s ease, opacity 0.3s ease",
                opacity: 0.8,
                "&:hover": {
                  transform: "scale(1.05)",
                  opacity: 1,
                },
              }}
            >
              <LinkedInIcon />
            </IconButton>
          </Box>

          {/* PB Real Estate Logo */}
          <Box
            component={RouterLink}
            to={`/${urlLang}/`}
            aria-label="Paulo Braga Real Estate"
            sx={{ display: "inline-block" }}
          >
            <Box
              component="img"
              src={secondLogo}
              alt="Paulo Braga Real Estate Logo"
              sx={{
                height: { xs: 40, md: 50 },
                transition: "transform 0.3s ease, opacity 0.3s ease",
                opacity: 0.8,
                "&:hover": {
                  transform: "scale(1.05)",
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Box>

        {/* Row 1, Col 1: KW Section */}
        <Box
          sx={{
            gridColumn: 1,
            gridRow: 1,
            alignSelf: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
            gap: 1,
          }}
        >
          <Box
            component={Link}
            href="https://www.kwportugal.pt/pt/agencia/KW-Sol-Oeiras/8336"
            target="_blank"
            rel="noopener"
            sx={{
              display: "inline-block",
              borderRadius: "4px",
              p: 0.5,
              width: "fit-content",
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="KW Sol Oeiras Logo"
              sx={{
                height: { xs: 36, md: 48 },
                transition: "transform 0.3s ease, opacity 0.3s ease",
                opacity: 0.8,
                "&:hover": {
                  transform: "scale(1.05)",
                  opacity: 1,
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Talentos de Andrómeda - Mediação Imobiliária, LDA
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            AMI 12223 | ICV registado no Banco de Portugal n° 919
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            NIPC 513689206
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Rua José Régio 1 B,
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            2780-129 Oeiras - Portugal
          </Typography>
        </Box>
      </Box>
      {/* Absolute copyright in bottom-right */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 16, md: 45 },
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
          px: { xs: 0, md: 6 },
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: "'Montserrat', sans-serif", opacity: 0.8 }}
        >
          © {new Date().getFullYear()} Paulo Braga Real Estate
        </Typography>
      </Box>
    </Box>
  );
}
