import { Box, Typography } from "@mui/material";
import Rule from "./Rule";
import monogram from "../assets/thb-monogram.svg";

/**
 * Tourism & Hospitality Real Estate Lens (Componentes Visuais v0.9 s.4).
 * Fixed title, distinct panel, and an explicit separation of fact,
 * interpretation and implication. Deliberately plain: it must not read as an
 * advertisement (Sistema Visual v1.0 s.7).
 */
export default function Lens({ lens, labels, sx }) {
  if (!lens) return null;
  const parts = [
    { key: "fact", label: labels.fact, text: lens.fact },
    { key: "interpretation", label: labels.interpretation, text: lens.interpretation },
    { key: "implication", label: labels.implication, text: lens.implication },
  ].filter((part) => part.text);

  return (
    <Box
      component="section"
      aria-labelledby="thb-lens-title"
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        borderTop: "2px solid",
        borderTopColor: "thb.petroleum",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 3, sm: 5, md: 5.5 },
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          component="img"
          src={monogram}
          alt=""
          aria-hidden="true"
          sx={{ width: 34, height: 34, flexShrink: 0, display: "block" }}
        />
        <Typography
          id="thb-lens-title"
          variant="overline"
          component="h2"
          sx={{ color: "thb.petroleum", m: 0 }}
        >
          {labels.title}
        </Typography>
      </Box>

      {lens.headline ? (
        <Typography variant="h2" component="p" sx={{ mt: 3, color: "thb.petroleum" }}>
          {lens.headline}
        </Typography>
      ) : null}

      <Box sx={{ mt: 4, mb: 4, height: "1px", backgroundColor: "thb.beige" }} />

      <Box
        sx={{
          display: "grid",
          gap: 5,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr)",
          },
        }}
      >
        {parts.map((part, index) => (
          <Box
            key={part.key}
            sx={{
              minWidth: 0,
              borderLeft: { md: index === 0 ? "none" : "1px solid" },
              borderColor: { md: "thb.beige" },
              pl: { md: index === 0 ? 0 : 5 },
            }}
          >
            <Rule />
            <Typography
              variant="overline"
              component="p"
              sx={{ mt: 1.5, fontSize: "0.65625rem", color: "thb.petroleum" }}
            >
              {part.label}
            </Typography>
            <Typography
              component="p"
              sx={{ mt: 2, fontSize: "0.96875rem", lineHeight: 1.7, color: "thb.petroleum" }}
            >
              {part.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
