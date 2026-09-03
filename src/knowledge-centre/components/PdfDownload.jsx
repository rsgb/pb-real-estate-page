import { Box, Button, Link as MuiLink, Typography } from "@mui/material";
import { useThbLang } from "../lang";

const PDF_LANGS = ["pt", "en"];

/**
 * The edition PDF. Files live in /public/briefs and keep the
 * THB_[Horizonte]_[Periodo]_[Idioma]_PDF_vX.Y.pdf naming (Sistema Visual v1.0 s.14).
 * A file size is shown only when the edition actually carries `pdfSize`.
 *
 * Two equal outlined buttons made the reader choose a language before choosing
 * to download. The PDF in the language they are already reading is now the one
 * filled petroleum button; the other language is a plain text link beside it,
 * available without competing for the eye.
 */
export default function PdfDownload({ edition, sx }) {
  const { contentLang, t } = useThbLang();
  if (!edition?.pdf) return null;

  const available = PDF_LANGS.filter((key) => edition.pdf[key]);
  const primaryKey = available.includes(contentLang) ? contentLang : available[0];
  if (!primaryKey) return null;
  const secondaryKeys = available.filter((key) => key !== primaryKey);

  const label = (key) => `${t.downloadPdf} (${key.toUpperCase()})`;
  const Size = ({ value }) =>
    value ? (
      <Typography component="span" variant="caption" sx={{ color: "thb.greyGreen" }}>
        {value}
      </Typography>
    ) : null;

  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 3, rowGap: 1.5, ...sx }}
    >
      <Button
        component="a"
        href={`/briefs/${edition.pdf[primaryKey]}`}
        download={edition.pdf[primaryKey]}
        variant="contained"
        sx={{
          backgroundColor: "thb.petroleum",
          color: "thb.ivory",
          borderRadius: 0,
          minHeight: 44,
          px: 3.5,
          fontSize: "1rem",
          alignItems: "baseline",
          gap: 1,
          "&:hover": { backgroundColor: "thb.petroleum", opacity: 0.9 },
        }}
      >
        {label(primaryKey)}
        <Size value={edition.pdfSize?.[primaryKey]} />
      </Button>

      {secondaryKeys.map((key) => (
        <Typography key={key} component="p" variant="body2" sx={{ color: "thb.greyGreen" }}>
          <MuiLink
            component="a"
            href={`/briefs/${edition.pdf[key]}`}
            download={edition.pdf[key]}
            sx={{ color: "thb.petroleum", fontWeight: 600 }}
          >
            {label(key)}
          </MuiLink>{" "}
          <Size value={edition.pdfSize?.[key]} />
        </Typography>
      ))}
    </Box>
  );
}
