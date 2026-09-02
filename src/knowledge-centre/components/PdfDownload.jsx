import { Box, Button, Typography } from "@mui/material";
import { useThbLang } from "../lang";

const PDF_LANGS = [
  { key: "pt", label: "PT" },
  { key: "en", label: "EN" },
];

/**
 * One download button per language. Files live in /public/briefs and keep the
 * THB_[Horizonte]_[Periodo]_[Idioma]_PDF_vX.Y.pdf naming (Sistema Visual v1.0 s.14).
 * A file size is shown only when the edition actually carries `pdfSize`.
 */
export default function PdfDownload({ edition, sx }) {
  const { t } = useThbLang();
  if (!edition?.pdf) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, ...sx }}>
      {PDF_LANGS.filter(({ key }) => edition.pdf[key]).map(({ key, label }) => {
        const file = edition.pdf[key];
        const size = edition.pdfSize?.[key];
        return (
          <Button
            key={key}
            component="a"
            href={`/briefs/${file}`}
            download={file}
            variant="outlined"
            sx={{
              borderColor: "thb.petroleum",
              color: "thb.petroleum",
              borderRadius: 0,
              px: 2.5,
              py: 1.25,
              alignItems: "baseline",
              gap: 1,
              "&:hover": { borderColor: "thb.petroleum", backgroundColor: "thb.ivory" },
            }}
          >
            {`${t.downloadPdf} (${label})`}
            {size ? (
              <Typography component="span" variant="caption" sx={{ color: "thb.greyGreen" }}>
                {size}
              </Typography>
            ) : null}
          </Button>
        );
      })}
    </Box>
  );
}
