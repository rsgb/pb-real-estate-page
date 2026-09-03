import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useLang } from "./LangContext";
import { PhoneIcon, MailIcon, WhatsAppIcon, LinkedInIcon } from "./icons.jsx";
import kwLogo from "../images/KWsol white.png";
import wordmark from "../images/PBre white.png";

const LEGAL = [
  "Talentos de Andrómeda - Mediação Imobiliária, LDA",
  "AMI 12223 | ICV registado no Banco de Portugal n° 919",
  "NIPC 513689206",
  "Rua José Régio 1 B,",
  "2780-129 Oeiras - Portugal",
];

const SOCIALS = [
  { Icon: PhoneIcon, label: "Telefone", href: "tel:+351915312417", external: false },
  {
    Icon: MailIcon,
    label: "Email",
    href: "mailto:paulo.braga@kwportugal.pt",
    external: false,
  },
  {
    Icon: WhatsAppIcon,
    label: "WhatsApp",
    href: "https://wa.me/351915312417",
    external: true,
  },
  {
    Icon: LinkedInIcon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/paulobragarealestateagentkwportugal/",
    external: true,
  },
];

export default function Footer() {
  const { urlLang } = useLang();

  const focusRing = (theme) => ({
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.custom.champagne}`,
      outlineOffset: 3,
    },
  });

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        width: "100%",
        backgroundColor: theme.palette.custom.footerBg,
        borderTop: `1px solid ${theme.palette.custom.champagne}`,
        color: theme.palette.custom.onNavyMuted,
        pt: { xs: 5.5, md: 8 },
      })}
    >
      <Box sx={{ width: "100%", maxWidth: 1146, mx: "auto", px: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
            gap: { xs: 5, md: 10 },
            alignItems: "start",
            justifyItems: { xs: "center", md: "stretch" },
          }}
        >
          {/* Agency */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            <Box
              component="a"
              href="https://www.kwportugal.pt/pt/agencia/KW-Sol-Oeiras/8336"
              target="_blank"
              rel="noopener noreferrer"
              sx={[{ display: "inline-flex" }, focusRing]}
            >
              <Box
                component="img"
                src={kwLogo}
                alt="KW Sol Oeiras"
                sx={{ display: "block", width: { xs: 160, md: 168 }, height: "auto" }}
              />
            </Box>
            <Box
              sx={(theme) => ({
                width: 44,
                height: "1px",
                backgroundColor: theme.palette.custom.champagne,
                mt: { xs: "22px", md: "26px" },
                mb: { xs: "20px", md: "22px" },
              })}
            />
            <Box>
              {LEGAL.map((line) => (
                <Typography
                  key={line}
                  component="p"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "custom.onNavyMuted",
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Contact icons + wordmark */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-end" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
              {SOCIALS.map((social) => {
                const Icon = social.Icon;
                const { label, href, external } = social;
                return (
                <Box
                  key={label}
                  component="a"
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  sx={[
                    (theme) => ({
                      width: 44,
                      height: 44,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.custom.champagne,
                      "&:hover": { color: theme.palette.custom.warmWhite },
                    }),
                    focusRing,
                  ]}
                >
                  <Icon size={20} />
                </Box>
                );
              })}
            </Box>
            <Box
              component={RouterLink}
              to={`/${urlLang}/`}
              aria-label="Paulo Braga Real Estate"
              sx={[{ display: "inline-flex", mt: { xs: "26px", md: "32px" } }, focusRing]}
            >
              <Box
                component="img"
                src={wordmark}
                alt="Paulo Braga Real Estate"
                sx={{ display: "block", width: 150, height: "auto" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Bottom rule + copyright */}
        <Box
          sx={{
            height: "1px",
            backgroundColor: "rgba(248, 246, 242, 0.10)",
            mt: { xs: "32px", md: "52px" },
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
            py: { xs: "20px", md: "24px" },
          }}
        >
          <Typography
            component="p"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              color: "custom.onNavyMuted",
              opacity: 0.8,
            }}
          >
            © {new Date().getFullYear()} Paulo Braga Real Estate
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
