import { Box, Typography } from "@mui/material";
import { UI } from "../../content/ui";
import { useThbLang } from "../lang";

/**
 * Shown to ES and FR visitors: the Brief is authored in PT and EN only, so they
 * are reading the English edition. The page itself canonicalises to the English
 * URL and is marked noindex (see the pages).
 */
export default function LangNotice({ sx }) {
  const { siteLang, notice } = useThbLang();
  if (!notice) return null;

  return (
    <Box
      role="note"
      sx={{
        backgroundColor: "thb.ivory",
        border: "1px solid",
        borderColor: "thb.beige",
        borderLeft: "4px solid",
        borderLeftColor: "thb.terracotta",
        px: 2,
        py: 1.5,
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        component="p"
        lang={String(siteLang).toLowerCase()}
        sx={{ color: "thb.petroleum", fontWeight: 600 }}
      >
        {notice}
      </Typography>
      <Typography variant="body2" component="p" lang="en" sx={{ color: "thb.greyGreen", mt: 0.5 }}>
        {UI.en.availability}
      </Typography>
    </Box>
  );
}
