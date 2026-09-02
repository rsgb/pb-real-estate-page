import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { formatDate } from "../../lib/format";
import { pick, useThbLang } from "../lang";
import { READING_WIDTH } from "../theme";

/** Sources and methodology block (Componentes Visuais v0.9 s.4). */
export default function Sources({ sources, methodologyHref, sx }) {
  const { contentLang, t } = useThbLang();
  if (!sources) return null;

  const complementary = (sources.complementary ?? []).map((entry) => pick(entry, contentLang));
  const notes = pick(sources.notes, contentLang);
  const status = sources.status ? t.dataStatus[sources.status] : null;

  const Row = ({ label, children }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "12rem 1fr" }, columnGap: 2, rowGap: 0.5 }}>
      <Typography variant="overline" component="dt" sx={{ color: "thb.greyGreen" }}>
        {label}
      </Typography>
      <Box component="dd" sx={{ m: 0 }}>
        {children}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        p: { xs: 2, sm: 3 },
        maxWidth: READING_WIDTH,
        ...sx,
      }}
    >
      <Box component="dl" sx={{ m: 0, display: "grid", gap: 2 }}>
        <Row label={t.primarySource}>
          <Typography variant="body2" component="p" sx={{ color: "thb.petroleum" }}>
            {pick(sources.primary, contentLang)}
          </Typography>
        </Row>

        {complementary.length ? (
          <Row label={t.complementarySources}>
            <Box component="ul" sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.5 }}>
              {complementary.map((entry, index) => (
                <Typography key={index} variant="body2" component="li" sx={{ color: "thb.petroleum" }}>
                  {entry}
                </Typography>
              ))}
            </Box>
          </Row>
        ) : null}

        {sources.releaseDate ? (
          <Row label={t.releaseDate}>
            <Typography variant="body2" component="p" sx={{ color: "thb.petroleum" }}>
              <time dateTime={sources.releaseDate}>{formatDate(sources.releaseDate, contentLang)}</time>
            </Typography>
          </Row>
        ) : null}

        {status ? (
          <Row label={t.dataStatusLabel}>
            <Typography variant="body2" component="p" sx={{ color: "thb.petroleum" }}>
              {status}
            </Typography>
          </Row>
        ) : null}

        {notes ? (
          <Row label={t.notes}>
            <Typography variant="body2" component="p" sx={{ color: "thb.petroleum" }}>
              {notes}
            </Typography>
          </Row>
        ) : null}
      </Box>

      {methodologyHref ? (
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "thb.beige" }}>
          <MuiLink component={RouterLink} to={methodologyHref} sx={{ color: "thb.petroleum", fontWeight: 600 }}>
            {t.readMethodology}
          </MuiLink>
        </Box>
      ) : null}
    </Box>
  );
}
