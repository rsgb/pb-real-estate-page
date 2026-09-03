import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { formatDate } from "../../lib/format";
import { pick, useThbLang } from "../lang";
import Rule from "./Rule";

/**
 * Sources and methodology block (Componentes Visuais v0.9 s.4).
 * Three columns of provenance in a secondary panel — white inside a beige
 * hairline, opened by the short terracotta rule, like every other panel that is
 * not the edition header.
 */
export default function Sources({ sources, methodologyHref, sx }) {
  const { contentLang, t } = useThbLang();
  if (!sources) return null;

  const complementary = (sources.complementary ?? []).map((entry) => pick(entry, contentLang));
  const notes = pick(sources.notes, contentLang);
  const status = sources.status ? t.dataStatus[sources.status] : null;

  const Entry = ({ label, children }) => (
    <Box>
      <Typography
        variant="overline"
        component="dt"
        sx={{ color: "thb.greyGreen", fontSize: "0.65625rem" }}
      >
        {label}
      </Typography>
      <Box component="dd" sx={{ m: 0, mt: 0.5 }}>
        {children}
      </Box>
    </Box>
  );

  const Text = ({ children, component = "p" }) => (
    <Typography
      variant="body2"
      component={component}
      sx={{ color: "thb.petroleum", lineHeight: 1.62 }}
    >
      {children}
    </Typography>
  );

  const columns = [
    <Box component="dl" sx={{ m: 0, display: "grid", gap: 2, alignContent: "start" }}>
      <Entry label={t.primarySource}>
        <Text>{pick(sources.primary, contentLang)}</Text>
      </Entry>
      {complementary.length ? (
        <Entry label={t.complementarySources}>
          <Box component="ul" sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.5 }}>
            {complementary.map((entry, index) => (
              <Typography
                key={index}
                variant="body2"
                component="li"
                sx={{ color: "thb.petroleum", lineHeight: 1.62 }}
              >
                {entry}
              </Typography>
            ))}
          </Box>
        </Entry>
      ) : null}
    </Box>,
    <Box component="dl" sx={{ m: 0, display: "grid", gap: 2, alignContent: "start" }}>
      {sources.releaseDate ? (
        <Entry label={t.releaseDate}>
          <Text>
            <time dateTime={sources.releaseDate}>
              {formatDate(sources.releaseDate, contentLang)}
            </time>
          </Text>
        </Entry>
      ) : null}
      {status ? (
        <Entry label={t.dataStatusLabel}>
          <Text>{status}</Text>
        </Entry>
      ) : null}
    </Box>,
    <>
      {notes ? (
        <Box component="dl" sx={{ m: 0, display: "grid", gap: 2, alignContent: "start" }}>
          <Entry label={t.notes}>
            <Text>{notes}</Text>
          </Entry>
        </Box>
      ) : null}
      {methodologyHref ? (
        <Box>
          <MuiLink
            component={RouterLink}
            to={methodologyHref}
            sx={{ color: "thb.petroleum", fontWeight: 600 }}
          >
            {t.readMethodology}
          </MuiLink>
        </Box>
      ) : null}
    </>,
  ];

  return (
    <Box
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        px: { xs: 2, sm: 3.5, md: 5 },
        py: { xs: 2.5, sm: 3.5, md: 4 },
        ...sx,
      }}
    >
      <Rule />
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gap: { xs: 3, md: 6.5 },
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {columns.map((column, index) => (
          <Box
            key={index}
            sx={{
              minWidth: 0,
              display: "grid",
              gap: 2,
              alignContent: "start",
              borderLeft: { md: index === 0 ? "none" : "1px solid" },
              borderColor: { md: "thb.beige" },
              pl: { md: index === 0 ? 0 : 6.5 },
            }}
          >
            {column}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
