import { Box, Typography } from "@mui/material";
import { READING_WIDTH } from "../theme";

/** Body copy as an array of paragraphs, held to a comfortable measure. */
export default function RichText({ paragraphs = [], variant = "body1", sx }) {
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  if (!list.length) return null;
  return (
    <Box sx={{ maxWidth: READING_WIDTH, ...sx }}>
      {list.filter(Boolean).map((paragraph, index) => (
        <Typography
          key={index}
          variant={variant}
          component="p"
          sx={{ mt: index === 0 ? 0 : 2, color: "thb.petroleum" }}
        >
          {paragraph}
        </Typography>
      ))}
    </Box>
  );
}
