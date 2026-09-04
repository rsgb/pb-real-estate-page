import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { editionSlug, editionTitle, formatPeriod } from "../../lib/format";
import { useThbLang } from "../lang";

/**
 * Previous / next navigation, restricted to the same editorial horizon, plus a
 * route back to the series page. `prev` is the older edition. `basePath` is
 * expected to end with a slash: trailing-slash URLs are canonical site-wide.
 *
 * Plain links under a beige hairline; the 64px of air above it comes from the
 * edition page's zone grid, so the nav reads as a separate zone, not a footer
 * hanging off the last section.
 */
export default function EditionNav({ prev, next, basePath, sx }) {
  const { contentLang, t } = useThbLang();

  const Item = ({ edition, label, align }) =>
    edition ? (
      <Box sx={{ textAlign: align, minWidth: 0 }}>
        <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
          {label}
        </Typography>
        <MuiLink
          component={RouterLink}
          to={`${basePath}${editionSlug(edition.id)}/`}
          aria-label={`${label}: ${editionTitle(edition, contentLang)}`}
          sx={{ color: "thb.petroleum", fontWeight: 600 }}
        >
          {formatPeriod(edition, contentLang)}
        </MuiLink>
      </Box>
    ) : (
      <Box />
    );

  return (
    <Box
      component="nav"
      aria-label={t.archive}
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: "thb.beige",
        pt: 3,
        ...sx,
      }}
    >
      <Item edition={prev} label={t.previousEdition} align="left" />
      <MuiLink
        component={RouterLink}
        to={basePath}
        sx={{ color: "thb.petroleum", fontWeight: 600, textAlign: "center" }}
      >
        {t.backToSeries}
      </MuiLink>
      <Item edition={next} label={t.nextEdition} align="right" />
    </Box>
  );
}
