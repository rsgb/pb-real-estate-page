#!/usr/bin/env node
/**
 * Build gate for Tourism & Hospitality Brief editions.
 *
 * Every `src/content/editions/20*.json` file must:
 *   1. validate against edition.schema.json (JSON Schema 2020-12);
 *   2. keep each language of `takeaway` within the recommended 45 words
 *      (Componentes Visuais v0.9 s.4);
 *   3. carry both PT and EN, non-empty, in every localised field
 *      (Componentes Visuais v0.9 s.6: PT and EN are two versions of the same
 *      edition, never a partial translation);
 *   4. point at PDF files that actually exist in public/briefs.
 *
 * It also warns (without failing the build) when an edition looks like a
 * backfilled one but is not flagged `historical` — see HISTORICAL_LAG_DAYS.
 *
 * Run: node scripts/validate-editions.mjs  (also wired as npm "prebuild").
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDITIONS_DIR = path.join(ROOT, "src", "content", "editions");
const SCHEMA_PATH = path.join(EDITIONS_DIR, "edition.schema.json");
const BRIEFS_DIR = path.join(ROOT, "public", "briefs");
const TAKEAWAY_MAX_WORDS = 45;
const LANGS = ["pt", "en"];
/**
 * An edition published more than this many days after its period closed is
 * almost certainly part of Paulo's backfill (January 2025 → June 2026) and
 * should carry `historical: true`. Four months is comfortably longer than the
 * normal lag between the INE release and publication.
 */
const HISTORICAL_LAG_DAYS = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

const errors = [];
const warnings = [];
const rel = (p) => path.relative(ROOT, p);
const fail = (file, message) => errors.push(`${file}: ${message}`);

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

/** True for a localised `{ pt, en }` container (strings or paragraph arrays). */
function isLocalized(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => LANGS.includes(k));
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmpty);
  return false;
}

/** Depth-first walk asserting both languages are present and non-empty. */
function checkLocalized(value, file, trail = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkLocalized(item, file, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;

  if (isLocalized(value)) {
    for (const lang of LANGS) {
      if (!(lang in value)) fail(file, `${trail} is missing "${lang}"`);
      else if (isEmpty(value[lang])) fail(file, `${trail}.${lang} is empty`);
    }
    // A localised container can still hold paragraph arrays worth walking.
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    checkLocalized(child, file, `${trail}.${key}`);
  }
}

/**
 * Last calendar day of the edition's reference period, as a UTC timestamp.
 * @returns {number|null} null when the period is incomplete for its horizon.
 */
function periodEnd(edition) {
  const { year, month, quarter, half } = edition.period ?? {};
  if (!year) return null;
  // Last month of the period, 1-12.
  let lastMonth;
  switch (edition.horizon) {
    case "monthly":
      lastMonth = month;
      break;
    case "quarterly":
      lastMonth = quarter ? quarter * 3 : undefined;
      break;
    case "half-year":
      lastMonth = half ? half * 6 : undefined;
      break;
    case "annual":
      lastMonth = 12;
      break;
    default:
      return null;
  }
  if (!lastMonth) return null;
  // Day 0 of the following month is the last day of `lastMonth`.
  return Date.UTC(year, lastMonth, 0);
}

/** Days between the close of the period and the publication date. */
function publicationLagDays(edition) {
  const end = periodEnd(edition);
  if (end === null) return null;
  const [y, m, d] = String(edition.publishedAt ?? "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return Math.round((Date.UTC(y, m - 1, d) - end) / DAY_MS);
}

function main() {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`validate-editions: schema not found at ${rel(SCHEMA_PATH)}`);
    process.exit(1);
  }

  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addFormat("date", /^\d{4}-\d{2}-\d{2}$/);
  const validate = ajv.compile(schema);

  const files = fs
    .readdirSync(EDITIONS_DIR)
    .filter((name) => /^20.*\.json$/.test(name))
    .sort();

  if (files.length === 0) {
    console.error(`validate-editions: no edition files found in ${rel(EDITIONS_DIR)}`);
    process.exit(1);
  }

  for (const name of files) {
    const file = rel(path.join(EDITIONS_DIR, name));
    let edition;
    try {
      edition = JSON.parse(fs.readFileSync(path.join(EDITIONS_DIR, name), "utf8"));
    } catch (error) {
      fail(file, `is not valid JSON — ${error.message}`);
      continue;
    }

    // 1. Schema.
    if (!validate(edition)) {
      for (const error of validate.errors ?? []) {
        fail(file, `schema ${error.instancePath || "/"} ${error.message}`);
      }
    }

    // Filename and id must agree, or the archive links break.
    const expected = `${edition.id}.json`;
    if (edition.id && name !== expected) {
      fail(file, `filename does not match id "${edition.id}" (expected ${expected})`);
    }

    // 2. Takeaway length.
    for (const lang of LANGS) {
      const text = edition.takeaway?.[lang];
      if (typeof text === "string") {
        const words = countWords(text);
        if (words > TAKEAWAY_MAX_WORDS) {
          fail(file, `takeaway.${lang} has ${words} words (maximum ${TAKEAWAY_MAX_WORDS})`);
        }
      }
    }

    // 3. Bilingual completeness.
    checkLocalized(edition, file);

    // Non-fatal: backfilled editions must be marked so readers are not misled
    // into taking an old period for current reporting.
    if (edition.historical !== true) {
      const lag = publicationLagDays(edition);
      if (lag !== null && lag > HISTORICAL_LAG_DAYS) {
        warnings.push(
          `${file}: publishedAt is ${lag} days after the end of the period ` +
            `(more than ${HISTORICAL_LAG_DAYS}) — consider "historical": true`
        );
      }
      if (edition.historicalNote) {
        warnings.push(
          `${file}: historicalNote is set without "historical": true — the note will not be shown`
        );
      }
    }

    // Non-fatal: the signature / og image is referenced by <meta og:image>.
    for (const key of ["signatureImage", "ogImage"]) {
      const image = edition[key];
      if (image && !fs.existsSync(path.join(BRIEFS_DIR, image))) {
        warnings.push(`${file}: ${key} "${image}" not found in ${rel(BRIEFS_DIR)}`);
      }
    }

    // 4. PDFs on disk.
    for (const lang of LANGS) {
      const pdf = edition.pdf?.[lang];
      if (!pdf) continue;
      const target = path.join(BRIEFS_DIR, pdf);
      if (!fs.existsSync(target)) {
        fail(file, `pdf.${lang} "${pdf}" not found in ${rel(BRIEFS_DIR)}`);
      }
    }
  }

  if (errors.length) {
    for (const warning of warnings) console.warn(`  ! ${warning}`);
    console.error(`\nvalidate-editions: ${errors.length} problem(s) found\n`);
    for (const error of errors) console.error(`  ✗ ${error}`);
    console.error("");
    process.exit(1);
  }

  for (const warning of warnings) console.warn(`  ! ${warning}`);
  console.log(
    `validate-editions: ${files.length} edition(s) OK — ${files.join(", ")}`
  );
}

main();
