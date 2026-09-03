#!/usr/bin/env node
/**
 * Open Graph images for Tourism & Hospitality Brief editions.
 *
 * LinkedIn's link card is horizontal (1.91:1), so the square LinkedIn
 * signature Paulo publishes gets centre-cropped and loses the series name and
 * the period. This renders a purpose-made 1200x630 card per edition and per
 * language, reproducing the approved signature layout in landscape.
 *
 *   src/content/editions/20*.json  ->  public/og/thb-<id>-<lang>.png
 *
 * satori (JSX-free object syntax) -> SVG -> @resvg/resvg-js -> PNG, with
 * Inter 400/600/700 from @fontsource/inter. Period wording comes from
 * src/lib/format.js (`formatPeriod`) so the card can never drift from the page.
 *
 * Wired as npm "prebuild"; `npm run dev` does NOT run it. To regenerate
 * locally after editing an edition or this script:
 *
 *   node scripts/generate-og-images.mjs
 *
 * Rendering is skipped when the PNG is newer than both the edition JSON and
 * this script, so repeat builds are near-instant. public/og/ is gitignored.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { formatPeriod } from "../src/lib/format.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const EDITIONS_DIR = path.join(ROOT, "src", "content", "editions");
const OUT_DIR = path.join(ROOT, "public", "og");
const FONT_DIR = path.join(ROOT, "node_modules", "@fontsource", "inter", "files");

const LANGS = ["pt", "en"];
const WIDTH = 1200;
const HEIGHT = 630;

/* Brand palette (Sistema Visual v1.0). */
const IVORY = "#F4F0E7";
const PETROLEUM = "#163E3D";
const TERRACOTTA = "#C97849";
const BEIGE = "#C9C2B5";
const GREY_GREEN = "#5E6864";

const PADDING = 84;
const FRAME_INSET = 36;
const MONOGRAM = 92;

/** Backfilled editions say so on the card, in the card's own language. */
const HISTORICAL_LABEL = { pt: "EDIÇÃO HISTÓRICA", en: "HISTORICAL EDITION" };

const rel = (p) => path.relative(ROOT, p);

/* -------------------------------------------------------------------------- */
/* Fonts                                                                      */
/* -------------------------------------------------------------------------- */

function loadFonts() {
  return [400, 600, 700].map((weight) => {
    const file = path.join(FONT_DIR, `inter-latin-${weight}-normal.woff`);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing font ${rel(file)} — is @fontsource/inter installed?`);
    }
    return { name: "Inter", data: fs.readFileSync(file), weight, style: "normal" };
  });
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

const div = (style, children) => ({ type: "div", props: { style, children } });

const text = (style, value) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children: value },
});

/**
 * The landscape adaptation of THB_LinkedIn_Signature_*.jpg.
 *
 * `historicalLabel`, when present, is drawn in the slack above the
 * "Portugal | <period>" row and is absolutely positioned on purpose: the
 * approved layout must stay pixel-identical for ordinary editions.
 */
function card({ period, historicalLabel }) {
  return div(
    {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: PADDING,
      backgroundColor: IVORY,
      fontFamily: "Inter",
      position: "relative",
    },
    [
      // Inner frame.
      div({
        position: "absolute",
        top: FRAME_INSET,
        left: FRAME_INSET,
        width: WIDTH - FRAME_INSET * 2,
        height: HEIGHT - FRAME_INSET * 2,
        border: `2px solid ${PETROLEUM}`,
        borderRadius: 2,
      }),

      // Top block: rule, series name, divider, byline.
      div({ display: "flex", flexDirection: "column" }, [
        div({
          width: 88,
          height: 8,
          borderRadius: 2,
          backgroundColor: TERRACOTTA,
          marginBottom: 24,
        }),
        text(
          {
            fontSize: 78,
            fontWeight: 700,
            color: PETROLEUM,
            lineHeight: 1.05,
            letterSpacing: -1,
          },
          "Tourism &"
        ),
        text(
          {
            fontSize: 78,
            fontWeight: 700,
            color: PETROLEUM,
            lineHeight: 1.05,
            letterSpacing: -1,
          },
          "Hospitality Brief"
        ),
        div({
          width: WIDTH - PADDING * 2,
          height: 1,
          backgroundColor: BEIGE,
          marginTop: 28,
          marginBottom: 28,
        }),
        text({ fontSize: 40, fontWeight: 700, color: PETROLEUM, lineHeight: 1.2 }, "Paulo Braga"),
        text(
          { fontSize: 26, fontWeight: 600, color: GREY_GREEN, lineHeight: 1.3, marginTop: 6 },
          "Hospitality Real Estate Advisor"
        ),
      ]),

      // Bottom row: "Portugal | <period>" and the THB monogram.
      div(
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: MONOGRAM,
          position: "relative",
        },
        [
          ...(historicalLabel
            ? [
                text(
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: 1.6,
                    color: GREY_GREEN,
                    lineHeight: 1.2,
                  },
                  historicalLabel
                ),
              ]
            : []),
          div({ display: "flex", flexDirection: "row", alignItems: "center" }, [
            text({ fontSize: 34, fontWeight: 700, color: PETROLEUM, lineHeight: 1.2 }, "Portugal"),
            div({
              width: 4,
              height: 34,
              backgroundColor: TERRACOTTA,
              marginLeft: 18,
              marginRight: 18,
            }),
            text({ fontSize: 34, fontWeight: 700, color: PETROLEUM, lineHeight: 1.2 }, period),
          ]),
          div(
            {
              width: MONOGRAM,
              height: MONOGRAM,
              borderRadius: MONOGRAM / 2,
              backgroundColor: PETROLEUM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            [text({ fontSize: 24, fontWeight: 700, color: IVORY, letterSpacing: 1 }, "THB")]
          ),
        ]
      ),
    ]
  );
}

/* -------------------------------------------------------------------------- */
/* Render                                                                     */
/* -------------------------------------------------------------------------- */

async function renderPng(edition, contentLang, fonts) {
  const svg = await satori(
    card({
      period: formatPeriod(edition, contentLang),
      historicalLabel: edition.historical ? HISTORICAL_LABEL[contentLang] : null,
    }),
    { width: WIDTH, height: HEIGHT, fonts }
  );
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  return resvg.render().asPng();
}

/** True when `out` exists and is newer than every file in `sources`. */
function isFresh(out, sources) {
  if (!fs.existsSync(out)) return false;
  const outMtime = fs.statSync(out).mtimeMs;
  return sources.every((src) => fs.statSync(src).mtimeMs <= outMtime);
}

async function main() {
  const editionFiles = fs
    .readdirSync(EDITIONS_DIR)
    .filter((f) => /^20.*\.json$/.test(f))
    .sort()
    .map((f) => path.join(EDITIONS_DIR, f));

  if (!editionFiles.length) {
    console.log("generate-og-images: no editions found, nothing to do.");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const fonts = loadFonts();
  let written = 0;
  let skipped = 0;

  for (const file of editionFiles) {
    const edition = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const contentLang of LANGS) {
      const out = path.join(OUT_DIR, `thb-${edition.id}-${contentLang}.png`);
      if (isFresh(out, [file, SCRIPT_PATH])) {
        skipped += 1;
        continue;
      }
      fs.writeFileSync(out, await renderPng(edition, contentLang, fonts));
      console.log(`  wrote ${rel(out)}  (${WIDTH}x${HEIGHT})`);
      written += 1;
    }
  }

  console.log(
    `generate-og-images: ${written} written, ${skipped} up to date (${editionFiles.length} edition(s)).`
  );
}

main().catch((error) => {
  console.error(`generate-og-images: ${error.message}`);
  process.exitCode = 1;
});
