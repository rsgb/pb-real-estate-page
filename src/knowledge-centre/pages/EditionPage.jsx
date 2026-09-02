import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import { SITE_ORIGIN, useHead } from "../../lib/head";
import { editionTitle } from "../../lib/format";
import { getAdjacent, getEdition } from "../../content/editions";
import { pick, pickList, useThbLang } from "../lang";
import {
  BarList,
  Callout,
  DataTable,
  EditionHeader,
  EditionNav,
  IndicatorGrid,
  LangNotice,
  Lens,
  Outlook,
  PdfDownload,
  RichText,
  Section,
  Sources,
  Takeaway,
} from "../components";
import { READING_WIDTH } from "../theme";

/** Optional `tables` arrays attached to several section types. */
function SectionTables({ tables, contentLang }) {
  if (!tables?.length) return null;
  return (
    <>
      {tables.map((table, index) => (
        <DataTable
          key={index}
          caption={pick(table.caption, contentLang)}
          columns={table.columns}
          rows={table.rows}
          source={pick(table.source, contentLang)}
          contentLang={contentLang}
        />
      ))}
    </>
  );
}

export default function EditionPage() {
  const { lang, editionId } = useParams();
  const { siteLang, urlLang, contentLang, t, isTranslated } = useThbLang();
  const basePath = `/${lang ?? urlLang}/knowledge-centre/`;
  const edition = getEdition(editionId);

  const takeaway = pick(edition?.takeaway, contentLang);
  const title = edition ? editionTitle(edition, contentLang) : t.notFoundTitle;
  const canonicalPath = edition
    ? `/${contentLang}/knowledge-centre/${edition.id}/`
    : `/${contentLang}/knowledge-centre/`;
  const image = edition?.ogImage ?? edition?.signatureImage;

  useHead({
    title,
    description: takeaway || t.seriesTagline,
    lang: String(siteLang).toLowerCase(),
    canonical: `${SITE_ORIGIN}${canonicalPath}`,
    alternates: edition
      ? [
          { lang: "pt", href: `${SITE_ORIGIN}/pt/knowledge-centre/${edition.id}/` },
          { lang: "en", href: `${SITE_ORIGIN}/en/knowledge-centre/${edition.id}/` },
        ]
      : [],
    og: {
      title,
      description: takeaway || undefined,
      type: "article",
      ...(image ? { image: `${SITE_ORIGIN}/briefs/${image}` } : {}),
    },
    ...(edition ? {} : { robots: "noindex" }),
    ...(isTranslated ? {} : { robots: "noindex" }),
  });

  if (!edition) {
    return (
      <Box
      component="main"
      lang={isTranslated ? undefined : contentLang}
      sx={{ backgroundColor: "thb.ivory", py: { xs: 6, md: 10 } }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h1" component="h1" sx={{ color: "thb.petroleum" }}>
            {t.notFoundTitle}
          </Typography>
          <Typography variant="body1" component="p" sx={{ mt: 2, maxWidth: READING_WIDTH }}>
            {t.notFoundBody}
          </Typography>
          <MuiLink
            component={RouterLink}
            to={basePath}
            sx={{ display: "inline-block", mt: 3, color: "thb.petroleum", fontWeight: 600 }}
          >
            {t.backToSeries}
          </MuiLink>
        </Box>
      </Box>
    );
  }

  const { prev, next } = getAdjacent(edition.id);

  return (
    <Box
      component="main"
      lang={isTranslated ? undefined : contentLang}
      sx={{ backgroundColor: "thb.ivory", py: { xs: 4, md: 7 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "grid",
          gap: { xs: 5, md: 7 },
        }}
      >
        <LangNotice />

        {edition.sections.map((section) => {
          const label = pick(section.sectionLabel, contentLang);
          const headline = pick(section.headline, contentLang);

          switch (section.block) {
            case "header":
              return <EditionHeader key="header" edition={edition} section={section} />;

            case "executiveSummary":
              return (
                <Section key="executiveSummary" label={label} headline={headline}>
                  {section.callout?.kind === "conclusion" ? (
                    <Takeaway
                      label={t.executiveTakeaway}
                      text={pick(section.callout.body, contentLang)}
                    />
                  ) : (
                    <Callout
                      kind={section.callout?.kind}
                      title={pick(section.callout?.title, contentLang)}
                      body={pick(section.callout?.body, contentLang)}
                    />
                  )}
                  <RichText paragraphs={pickList(section.body, contentLang)} />
                </Section>
              );

            case "keyIndicators":
              return (
                <Section key="keyIndicators" label={label} headline={headline}>
                  <IndicatorGrid indicators={section.indicators} />
                  <RichText paragraphs={pickList(section.reading, contentLang)} />
                  <SectionTables tables={section.tables} contentLang={contentLang} />
                </Section>
              );

            case "demand":
              return (
                <Section key="demand" label={label} headline={headline}>
                  <IndicatorGrid indicators={section.indicators} />
                  <RichText paragraphs={pickList(section.body, contentLang)} />
                  <BarList barList={section.barList} />
                  <SectionTables tables={section.tables} contentLang={contentLang} />
                </Section>
              );

            case "regional":
              return (
                <Section key="regional" label={label} headline={headline}>
                  <BarList barList={section.barList} />
                  <RichText paragraphs={pickList(section.body, contentLang)} />
                  {section.callout ? (
                    <Callout
                      kind={section.callout.kind}
                      title={pick(section.callout.title, contentLang)}
                      body={pick(section.callout.body, contentLang)}
                    />
                  ) : null}
                  <SectionTables tables={section.tables} contentLang={contentLang} />
                </Section>
              );

            case "operating":
              return (
                <Section
                  key="operating"
                  label={label}
                  headline={headline}
                  scope={pick(section.scope, contentLang)}
                >
                  <IndicatorGrid indicators={section.indicators} />
                  <RichText paragraphs={pickList(section.body, contentLang)} />
                  <SectionTables tables={section.tables} contentLang={contentLang} />
                </Section>
              );

            case "lens":
              return (
                <Section key="lens" label={label}>
                  <Lens
                    lens={{
                      headline: pick(section.lens.headline, contentLang),
                      fact: pick(section.lens.fact, contentLang),
                      interpretation: pick(section.lens.interpretation, contentLang),
                      implication: pick(section.lens.implication, contentLang),
                    }}
                    labels={t.lens}
                  />
                </Section>
              );

            case "outlook":
              return (
                <Section key="outlook" label={label}>
                  <Outlook
                    intro={pick(section.outlook.intro, contentLang)}
                    signals={section.outlook.signals.map((signal) => pick(signal, contentLang))}
                  />
                </Section>
              );

            case "sources":
              return (
                <Section key="sources" label={label}>
                  <Sources
                    sources={section.sources}
                    methodologyHref={`${basePath}methodology/`}
                  />
                </Section>
              );

            default:
              return null;
          }
        })}

        <PdfDownload edition={edition} />
        <EditionNav prev={prev} next={next} basePath={basePath} />
      </Box>
    </Box>
  );
}
