/**
 * Edition URLs.
 *
 * Edition ids carry an uppercase period token ("2025-Q4", "2026-H1") because
 * the PDF names and the schema pattern use the same token. URLs cannot: Netlify
 * answers any path containing an uppercase letter with a 301 to the lower-cased
 * path, serves the folder case-insensitively, and the app then reads "2025-q4"
 * from the URL. Before the fix that lookup was exact and the page rendered
 * "Edition not found".
 *
 * So: every path, sitemap entry, pre-render folder and Open Graph file name is
 * built from `editionSlug(id)`, and the lookup is case-insensitive in both
 * directions.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { editionSlug } from "../src/lib/format.js";
import { createEditionRegistry } from "../src/content/editions/registry.js";
import { previewUrlFor } from "../netlify/functions/_lib/github.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EDITIONS_DIR = path.join(ROOT, "src", "content", "editions");

/** Every edition JSON on disk — the same set the Vite glob picks up. */
const EDITIONS = fs
  .readdirSync(EDITIONS_DIR)
  .filter((name) => /^20.*\.json$/.test(name))
  .sort()
  .map((name) => JSON.parse(fs.readFileSync(path.join(EDITIONS_DIR, name), "utf8")));

/* ------------------------------------------------------------------ helper */

test("editionSlug lower-cases the period token and leaves numeric ids alone", () => {
  assert.equal(editionSlug("2025-Q4"), "2025-q4");
  assert.equal(editionSlug("2025-H1"), "2025-h1");
  assert.equal(editionSlug("2026-Q2"), "2026-q2");
  assert.equal(editionSlug("2026-07"), "2026-07");
  assert.equal(editionSlug("2025"), "2025");
});

test("editionSlug is idempotent and safe on a missing id", () => {
  assert.equal(editionSlug(editionSlug("2025-Q4")), "2025-q4");
  assert.equal(editionSlug(undefined), "");
  assert.equal(editionSlug(null), "");
});

test("no real edition path contains an uppercase letter", () => {
  assert.ok(EDITIONS.length >= 29, `expected the full archive, got ${EDITIONS.length}`);
  for (const edition of EDITIONS) {
    const slug = editionSlug(edition.id);
    const url = `/en/market-brief/${slug}/`;
    const ogName = `thb-${slug}-pt.png`;
    assert.equal(url, url.toLowerCase(), `route for ${edition.id} is not lower-case`);
    assert.equal(ogName, ogName.toLowerCase(), `OG name for ${edition.id} is not lower-case`);
  }
});

test("slugs stay unique, so no two editions share a URL", () => {
  const slugs = EDITIONS.map((e) => editionSlug(e.id));
  assert.equal(new Set(slugs).size, slugs.length);
});

/* ---------------------------------------------------------------- registry */

const FIXTURES = [
  { id: "2025-Q3", horizon: "quarterly", period: { year: 2025, quarter: 3 } },
  { id: "2025-Q4", horizon: "quarterly", period: { year: 2025, quarter: 4 } },
  { id: "2026-Q1", horizon: "quarterly", period: { year: 2026, quarter: 1 } },
  { id: "2026-06", horizon: "monthly", period: { year: 2026, month: 6 } },
  { id: "2026-07", horizon: "monthly", period: { year: 2026, month: 7 } },
];

const fixtureRegistry = () => createEditionRegistry(FIXTURES.map((e) => ({ ...e })));

test("getEdition finds an edition by its id, whatever the case", () => {
  const { getEdition } = fixtureRegistry();
  for (const param of ["2025-Q4", "2025-q4", "2025-q4".toUpperCase()]) {
    assert.equal(getEdition(param)?.id, "2025-Q4", `lookup failed for ${param}`);
  }
  // The lower-case form is the one Netlify's redirect actually sends.
  assert.equal(getEdition("2026-h1"), undefined);
  assert.equal(getEdition("2026-07")?.id, "2026-07");
  assert.equal(getEdition(undefined), undefined);
});

test("the real archive resolves from the lower-cased URL segment", () => {
  const { getEdition } = createEditionRegistry(EDITIONS.map((e) => ({ ...e })));
  for (const edition of EDITIONS) {
    const fromUrl = getEdition(editionSlug(edition.id));
    assert.equal(fromUrl?.id, edition.id, `/${editionSlug(edition.id)}/ did not resolve`);
    // Links published before the fix carried the id verbatim; they still work.
    assert.equal(getEdition(edition.id)?.id, edition.id);
  }
});

test("getAdjacent stays inside the horizon and accepts either case", () => {
  const { getAdjacent } = fixtureRegistry();
  const fromId = getAdjacent("2025-Q4");
  const fromSlug = getAdjacent("2025-q4");

  assert.equal(fromId.prev?.id, "2025-Q3");
  assert.equal(fromId.next?.id, "2026-Q1");
  assert.deepEqual(fromSlug, fromId);

  // The newest quarterly has no next, and never links into a monthly edition.
  assert.equal(getAdjacent("2026-Q1").next, undefined);
  assert.equal(getAdjacent("2026-Q1").prev?.id, "2025-Q4");
  assert.deepEqual(getAdjacent("nope"), { prev: undefined, next: undefined });
});

test("prev/next links are built from the slug", () => {
  const { getAdjacent } = fixtureRegistry();
  const { prev, next } = getAdjacent("2025-q4");
  assert.equal(`/pt/market-brief/${editionSlug(prev.id)}/`, "/pt/market-brief/2025-q3/");
  assert.equal(`/pt/market-brief/${editionSlug(next.id)}/`, "/pt/market-brief/2026-q1/");
});

test("getLatest is the newest edition by period, not by id", () => {
  const { getLatest, getEditions } = fixtureRegistry();
  assert.equal(getLatest().id, "2026-07");
  assert.equal(getEditions().length, FIXTURES.length);
});

/* ----------------------------------------------------------- publish flow */

test("the deploy-preview URL uses the slug", () => {
  assert.match(previewUrlFor(42, "2025-Q4"), /\/pt\/market-brief\/2025-q4\/$/);
  assert.match(previewUrlFor(42, "2026-07"), /\/pt\/market-brief\/2026-07\/$/);
});
