/**
 * `src/lib/format.js` carries its own self-check, run as `node src/lib/format.js`
 * so the module stays dependency-free. This test runs that self-check under
 * `npm test`, so a formatting regression fails the same gate as everything else,
 * and pins the historical notice the edition header builds from it.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatDate, formatPeriodInSentence } from "../src/lib/format.js";
import { contentUi } from "../src/content/ui.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** `fillTemplate` from src/knowledge-centre/lang.js, which pulls in React. */
const fill = (template, values) =>
  String(template).replace(/\{(\w+)\}/g, (m, key) => values[key] ?? m);

const notice = (edition, lang) =>
  fill(contentUi(lang).historicalNotice, {
    date: formatDate(edition.publishedAt, lang),
    period: formatPeriodInSentence(edition, lang),
  });

test("the format.js self-check passes", () => {
  const run = spawnSync(process.execPath, [path.join(ROOT, "src", "lib", "format.js")], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
  assert.match(run.stdout, /self-check: \d+\/\d+ passed/);
});

test("the historical notice reads as a sentence in both languages", () => {
  const november = {
    horizon: "monthly",
    period: { year: 2025, month: 11 },
    publishedAt: "2026-09-08",
  };
  assert.equal(
    notice(november, "pt"),
    "Edição histórica, publicada a 8 de setembro de 2026, com dados do período novembro de 2025."
  );
  assert.equal(
    notice(november, "en"),
    "Historical edition, published on 8 September 2026 with data for November 2025."
  );

  const firstQuarter = {
    horizon: "quarterly",
    period: { year: 2025, quarter: 1 },
    publishedAt: "2026-09-08",
  };
  assert.equal(
    notice(firstQuarter, "pt"),
    "Edição histórica, publicada a 8 de setembro de 2026, com dados do período 1.º trimestre de 2025."
  );
  assert.equal(
    notice(firstQuarter, "en"),
    "Historical edition, published on 8 September 2026 with data for Q1 2025."
  );

  const year = { horizon: "annual", period: { year: 2025 }, publishedAt: "2026-09-08" };
  assert.equal(
    notice(year, "pt"),
    "Edição histórica, publicada a 8 de setembro de 2026, com dados do período 2025."
  );
  assert.equal(
    notice(year, "en"),
    "Historical edition, published on 8 September 2026 with data for 2025."
  );
});
