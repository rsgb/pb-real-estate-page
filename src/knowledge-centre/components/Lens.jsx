import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

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
        border: "1px solid",
        borderColor: "thb.petroleum",
        backgroundColor: "thb.ivory",
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: READING_WIDTH,
        ...sx,
      }}
    >
      <Typography
        id="thb-lens-title"
        variant="h3"
        component="h2"
        sx={{ color: "thb.petroleum", fontSize: { xs: "1.0625rem", sm: "1.125rem" } }}
      >
        {labels.title}
      </Typography>
      <Box sx={{ height: "2px", width: 48, backgroundColor: "thb.terracotta", mt: 1.5, mb: 2.5 }} />
      {lens.headline ? (
        <Typography variant="h2" component="p" sx={{ color: "thb.petroleum", mb: 3 }}>
          {lens.headline}
        </Typography>
      ) : null}
      <Box sx={{ display: "grid", gap: 2.5 }}>
        {parts.map((part) => (
          <Box key={part.key}>
            <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen", mb: 0.5 }}>
              {part.label}
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: "thb.petroleum" }}>
              {part.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
