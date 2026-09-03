import { Box, Typography } from "@mui/material";
import { UI } from "../../content/ui";
import Rule from "./Rule";
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
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        ...sx,
      }}
    >
      <Rule />
      <Typography
        variant="body2"
        component="p"
        lang={String(siteLang).toLowerCase()}
        sx={{ mt: 1.75, color: "thb.petroleum", fontWeight: 600 }}
      >
        {notice}
      </Typography>
      <Typography variant="body2" component="p" lang="en" sx={{ color: "thb.greyGreen", mt: 0.5 }}>
        {UI.en.availability}
      </Typography>
    </Box>
  );
}
