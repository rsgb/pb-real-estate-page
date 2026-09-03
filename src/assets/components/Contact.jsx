import { Box, Paper, Typography } from "@mui/material";
import { useLang } from "./LangContext";
import { PhoneIcon, MailIcon, WhatsAppIcon, LinkedInIcon } from "./icons.jsx";

const CONTACTS = [
  {
    Icon: PhoneIcon,
    value: "+351 915 312 417",
    href: "tel:+351915312417",
    external: false,
  },
  {
    Icon: MailIcon,
    value: "paulo.braga@kwportugal.pt",
    href: "mailto:paulo.braga@kwportugal.pt",
    external: false,
  },
  {
    Icon: WhatsAppIcon,
    value: "+351 915 312 417",
    href: "https://wa.me/351915312417",
    external: true,
  },
  {
    Icon: LinkedInIcon,
    value: "Paulo Braga",
    href: "https://www.linkedin.com/in/paulobragarealestateagentkwportugal/",
    external: true,
  },
];

const COPY = {
  EN: {
    heading: "Contact",
    labels: ["Phone", "Email", "WhatsApp", "LinkedIn"],
  },
  PT: {
    heading: "Contacto",
    labels: ["Telefone", "Email", "WhatsApp", "LinkedIn"],
  },
  ES: {
    heading: "Contacto",
    labels: ["Teléfono", "Email", "WhatsApp", "LinkedIn"],
  },
  FR: {
    heading: "Contact",
    labels: ["Téléphone", "E-mail", "WhatsApp", "LinkedIn"],
  },
};

export default function Contact() {
  const { lang } = useLang();
  const { heading, labels } = COPY[lang] ?? COPY.PT;

  return (
    <Box
      component="section"
      sx={{ bgcolor: "background.default", pb: { xs: 6.5, md: 11.5 } }}
    >
      <Box sx={{ width: "100%", maxWidth: 1146, mx: "auto", px: 3 }}>
        {/* PB monogram between two hairlines */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: "20px", md: "26px" },
            py: { xs: 5, md: 7 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              height: "1px",
              backgroundColor: "rgba(200, 178, 122, 0.45)",
            }}
          />
          <Box
            aria-hidden="true"
            sx={(theme) => ({
              width: 44,
              height: 44,
              flex: "none",
              borderRadius: "50%",
              border: `1px solid ${theme.palette.custom.champagne}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Libre Baskerville', serif",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.06em",
              color: theme.palette.custom.navy,
            })}
          >
            PB
          </Box>
          <Box
            sx={{
              flex: 1,
              height: "1px",
              backgroundColor: "rgba(200, 178, 122, 0.45)",
            }}
          />
        </Box>

        {/* Heading + rule */}
        <Box
          sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: "28px", md: "34px" },
              lineHeight: 1.2,
              color: "custom.navy",
              textAlign: "center",
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
              mb: { xs: "34px", md: "48px" },
            }}
          />
        </Box>

        {/* Tiles */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.75, md: 3.25 },
          }}
        >
          {CONTACTS.map((contact, index) => {
            const Icon = contact.Icon;
            const { value, href, external } = contact;
            return (
            <Paper
              key={labels[index] + value}
              elevation={0}
              component="a"
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              sx={(theme) => ({
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.custom.champagneHairline}`,
                textDecoration: "none",
                color: theme.palette.custom.navy,
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                alignItems: "center",
                justifyContent: { xs: "flex-start", md: "center" },
                textAlign: { xs: "left", md: "center" },
                gap: { xs: "18px", md: 0 },
                minHeight: { xs: 64, md: "auto" },
                p: { xs: "18px 20px", md: "28px 16px 30px" },
                "&:hover": { borderColor: theme.palette.custom.champagne },
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.custom.champagne}`,
                  outlineOffset: 2,
                },
              })}
            >
              <Box sx={{ flex: "none", display: "flex" }}>
                <Icon size={24} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="span"
                  sx={{
                    display: "block",
                    mt: { xs: 0, md: "18px" },
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "custom.textMuted",
                  }}
                >
                  {labels[index]}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    display: "block",
                    mt: { xs: "6px", md: "10px" },
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: { xs: "16px", md: "14.5px" },
                    fontWeight: 500,
                    color: "custom.navy",
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
