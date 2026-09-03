#!/usr/bin/env node
/**
 * Build gate for Tourism & Hospitality Brief editions.
 *
 * Walks `src/content/editions/20*.json`, hands every file to the shared
 * validator in `src/lib/edition-validation.mjs` — the same module the
 * /publicar page and the publish functions use, so a build and an upload can
 * never disagree — then prints the verdict and exits non-zero on errors.
 *
 * Only the two checks that need the filesystem live here: the filename must
 * match the edition id, and the PDF / signature images must exist in
 * public/briefs.
 *
 * Run: node scripts/validate-editions.mjs  (also wired as npm "prebuild").
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateEdition } from "../src/lib/edition-validation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDITIONS_DIR = path.join(ROOT, "src", "content", "editions");
const BRIEFS_DIR = path.join(ROOT, "public", "briefs");

const errors = [];
const warnings = [];
const rel = (p) => path.relative(ROOT, p);
const fail = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);

function main() {
  if (!fs.existsSync(EDITIONS_DIR)) {
    console.error(`validate-editions: folder not found at ${rel(EDITIONS_DIR)}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(EDITIONS_DIR)
    .filter((name) => /^20.*\.json$/.test(name))
    .sort();

  if (files.length === 0) {
    console.error(`validate-editions: no edition files found in ${rel(EDITIONS_DIR)}`);
    process.exit(1);
  }

  const pdfNamesPresent = fs.existsSync(BRIEFS_DIR)
    ? fs.readdirSync(BRIEFS_DIR).filter((name) => name.toLowerCase().endsWith(".pdf"))
    : [];

  for (const name of files) {
    const file = rel(path.join(EDITIONS_DIR, name));
    let edition;
    try {
      edition = JSON.parse(fs.readFileSync(path.join(EDITIONS_DIR, name), "utf8"));
    } catch (error) {
      fail(file, `não é JSON válido — ${error.message}`);
      continue;
    }

    const { errors: found, warnings: noted } = validateEdition(edition, { pdfNamesPresent });
    for (const message of found) fail(file, message);
    for (const message of noted) warn(file, message);

    // Filename and id must agree, or the archive links break.
    const expected = `${edition?.id}.json`;
    if (edition?.id && name !== expected) {
      fail(file, `o nome do ficheiro não corresponde ao id "${edition.id}" (esperado ${expected})`);
    }

    // Non-fatal: the signature / og image is referenced by <meta og:image>.
    for (const key of ["signatureImage", "ogImage"]) {
      const image = edition?.[key];
      if (image && !fs.existsSync(path.join(BRIEFS_DIR, image))) {
        warn(file, `${key}: "${image}" não foi encontrado em ${rel(BRIEFS_DIR)}`);
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
