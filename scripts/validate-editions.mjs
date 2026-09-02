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
