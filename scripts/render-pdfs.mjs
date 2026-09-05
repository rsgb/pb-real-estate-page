#!/usr/bin/env node
/**
 * Render every Tourism & Hospitality Brief edition's two PDFs from its JSON.
 *
 * Decision D-34: the PDF is a pure rendering of the reviewed JSON, so it is
 * generated on every build and never committed. Paulo uploads the JSON only;
 * `public/briefs/` holds no edition PDF in git (see .gitignore), and this
 * script puts the files there before Vite copies `public/` into `dist/`.
 *
 * For each `src/content/editions/20*.json` it runs
 *
 *   <python> scripts/pdf/render-pdf.py <json> --lang pt --out public/briefs/
 *   <python> scripts/pdf/render-pdf.py <json> --lang en --out public/briefs/
 *
 * naming each file from the JSON's own `pdf.pt` / `pdf.en`. The renderer needs
 * Python 3.8+ and reportlab and nothing else; `python3` is taken from PATH, or
 * from `PDF_PYTHON` when it is set (a venv, another interpreter).
 *
 * A language is re-rendered unless its PDF already exists and is newer than
 * both the edition JSON and the renderer, which keeps a local rebuild quick.
 * A Netlify build starts from a clean checkout with no PDFs at all, so there
 * every edition is rendered.
 *
 * Any renderer failure fails the build, with the renderer's own stderr.
 *
 * Run: node scripts/render-pdfs.mjs  (wired into npm "prebuild").
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDITIONS_DIR = path.join(ROOT, "src", "content", "editions");
const BRIEFS_DIR = path.join(ROOT, "public", "briefs");
const RENDERER = path.join(ROOT, "scripts", "pdf", "render-pdf.py");
const PYTHON = process.env.PDF_PYTHON || "python3";
const LANGS = ["pt", "en"];

const rel = (p) => path.relative(ROOT, p);

/** Fatal: print the reason and stop the build. */
function die(message, detail) {
  console.error(`\nrender-pdfs: ${message}\n`);
  if (detail) console.error(`${detail.trimEnd()}\n`);
  process.exit(1);
}

/** Last modification time in ms, or 0 when the file is not there. */
function mtime(file) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

/** Render one language of one edition; throws (dies) on a renderer failure. */
function render(jsonPath, lang) {
  const result = spawnSync(
    PYTHON,
    [RENDERER, jsonPath, "--lang", lang, "--out", BRIEFS_DIR],
    { encoding: "utf8", cwd: ROOT }
  );

  if (result.error) {
    if (result.error.code === "ENOENT") {
      die(
        `Python not found (tried "${PYTHON}"). The build renders the edition ` +
          `PDFs with scripts/pdf/render-pdf.py, which needs Python 3.8+ and ` +
          `reportlab (see requirements.txt). Set PDF_PYTHON to another ` +
          `interpreter if python3 is not on PATH.`
      );
    }
    die(`could not run "${PYTHON}" — ${result.error.message}`);
  }

  if (result.status !== 0) {
    die(
      `${rel(jsonPath)} (${lang}): the renderer exited with ${result.status}.`,
      `${result.stderr ?? ""}${result.stdout ?? ""}`
    );
  }
}

function main() {
  if (!fs.existsSync(RENDERER)) {
    die(`renderer not found at ${rel(RENDERER)}`);
  }
  if (!fs.existsSync(EDITIONS_DIR)) {
    die(`folder not found at ${rel(EDITIONS_DIR)}`);
  }
  fs.mkdirSync(BRIEFS_DIR, { recursive: true });

  // Same filter as scripts/validate-editions.mjs: edition ids start with a
  // year, which leaves edition.schema.json out.
  const files = fs
    .readdirSync(EDITIONS_DIR)
    .filter((name) => /^20.*\.json$/.test(name))
    .sort();

  if (files.length === 0) {
    die(`no edition files found in ${rel(EDITIONS_DIR)}`);
  }

  const rendererTime = mtime(RENDERER);
  const started = Date.now();
  let rendered = 0;
  let skipped = 0;

  for (const name of files) {
    const jsonPath = path.join(EDITIONS_DIR, name);
    const jsonTime = mtime(jsonPath);

    let edition;
    try {
      edition = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    } catch (error) {
      die(`${rel(jsonPath)} is not valid JSON — ${error.message}`);
    }

    const done = [];
    for (const lang of LANGS) {
      const filename = edition?.pdf?.[lang];
      if (typeof filename !== "string" || !filename) {
        die(`${rel(jsonPath)}: no "pdf.${lang}" filename to render into`);
      }
      const out = path.join(BRIEFS_DIR, filename);
      const outTime = mtime(out);

      if (outTime && outTime >= jsonTime && outTime >= rendererTime) {
        skipped += 1;
        continue;
      }

      render(jsonPath, lang);
      if (!fs.existsSync(out)) {
        die(
          `${rel(jsonPath)} (${lang}): the renderer reported success but ` +
            `${rel(out)} was not written`
        );
      }
      rendered += 1;
      done.push(lang);
    }

    const id = edition?.id ?? name.replace(/\.json$/, "");
    console.log(
      done.length === 0
        ? `  ${id}  up to date`
        : `  ${id}  rendered ${done.join(", ")}`
    );
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `render-pdfs: ${files.length} edition(s), ${rendered} PDF(s) rendered, ` +
      `${skipped} already up to date, ${seconds}s (${PYTHON})`
  );
}

main();
