import { Box, Typography } from "@mui/material";
import Rule from "./Rule";
import ThbMark from "./ThbMark";

/**
 * Tourism & Hospitality Real Estate Lens (Componentes Visuais v0.9 s.4).
 * Fixed title, distinct panel, and an explicit separation of fact,
 * interpretation and implication. Deliberately plain: it must not read as an
 * advertisement (Sistema Visual v1.0 s.7).
 *
 * Secondary panel: white inside a beige hairline, with the short terracotta
 * rule above its label. The 2px petroleum edge belongs to the page's one focal
 * panel — the edition header — and is not repeated here.
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
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 3, sm: 5, md: 5.5 },
        ...sx,
      }}
    >
      <Rule />

      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <ThbMark size={28} />
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

      <Box sx={{ mt: 3, mb: 3, height: "1px", backgroundColor: "thb.beige" }} />

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
