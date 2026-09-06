/**
 * In-place image optimisation.
 *
 *   node scripts/optimize-images.mjs [--dry]
 *
 * Walks src/assets/images and public, and for every JPEG/PNG:
 *   - downscales to at most MAX_WIDTH px wide (MAX_LOGO_WIDTH for brand logos,
 *     MAX_HERO_WIDTH for the full-bleed hero, which is stretched across retina
 *     viewports);
 *   - re-encodes in the SAME format under the SAME filename, so every import
 *     and <img src> keeps working:
 *       jpeg -> quality 80, progressive, mozjpeg
 *       png  -> compressionLevel 9, effort 10, palette when near-lossless
 *   - keeps the new file only when it is actually smaller than the original.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_DIRS = [
  path.join(ROOT, "src", "assets", "images"),
  path.join(ROOT, "public"),
];
/** Owned by the knowledge-centre agent - leave alone. */
const SKIP_DIRS = new Set(["briefs", "node_modules", ".git"]);

const MAX_WIDTH = 1600;
const MAX_LOGO_WIDTH = 800;
const MAX_HERO_WIDTH = 2560;
const JPEG_QUALITY = 80;
const EXTS = new Set([".jpg", ".jpeg", ".png"]);
/** Brand/partner marks - these only ever render small. */
const LOGO_RE = /(logo|pbre|kwsol|\bkw\b|chambers|host)/i;
/** Full-bleed hero photograph. */
const HERO_RE = /^hero-/i;

const DRY = process.argv.includes("--dry");

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (EXTS.has(path.extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

/** Mean/max per-channel difference between two same-sized RGBA buffers. */
function diff(a, b) {
  if (a.length !== b.length) return { mean: Infinity, max: Infinity };
  let sum = 0;
  let max = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = Math.abs(a[i] - b[i]);
    sum += d;
    if (d > max) max = d;
  }
  return { mean: sum / a.length, max };
}

/**
 * PNG: prefer a palette encode when it is near-lossless (exactly lossless for
 * <=256 colours; otherwise measured against the full-colour pixels).
 */
async function encodePng(pipeline) {
  const full = await pipeline
    .clone()
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toBuffer();

  const paletted = await pipeline
    .clone()
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 100, dither: 1 })
    .toBuffer();

  if (paletted.length >= full.length) return full;

  const [refRaw, palRaw] = await Promise.all([
    sharp(full).ensureAlpha().raw().toBuffer(),
    sharp(paletted).ensureAlpha().raw().toBuffer(),
  ]);
  const { mean, max } = diff(refRaw, palRaw);
  // <= 0.5/255 average and <= 8/255 worst-case is indistinguishable in practice.
  return mean <= 0.5 && max <= 8 ? paletted : full;
}

const rows = [];
let totalBefore = 0;
let totalAfter = 0;

for (const dir of TARGET_DIRS) {
  for await (const file of walk(dir)) {
    const before = (await fs.stat(file)).size;
    const ext = path.extname(file).toLowerCase();
    const isLogo = LOGO_RE.test(path.basename(file));
    const isHero = HERO_RE.test(path.basename(file));
    const maxWidth = isLogo ? MAX_LOGO_WIDTH : isHero ? MAX_HERO_WIDTH : MAX_WIDTH;

    const input = await fs.readFile(file);
    const image = sharp(input, { failOn: "none" });
    const meta = await image.metadata();

    const pipeline = sharp(input, { failOn: "none" }).rotate().resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    });

    const output =
      ext === ".png"
        ? await encodePng(pipeline)
        : await pipeline
            .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
            .toBuffer();

    const smaller = output.length < before;
    if (smaller && !DRY) await fs.writeFile(file, output);

    const after = smaller ? output.length : before;
    totalBefore += before;
    totalAfter += after;
    rows.push({
      file: path.relative(ROOT, file),
      w: meta.width,
      newW: Math.min(meta.width ?? maxWidth, maxWidth),
      before,
      after,
      kept: smaller,
    });
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const pad = (s, n) => String(s).padEnd(n);
const wide = Math.max(...rows.map((r) => r.file.length), 10);

console.log(
  `${pad("file", wide)}  ${pad("width", 12)}  ${pad("before", 10)}  ${pad("after", 10)}  saved`
);
for (const r of rows) {
  const saved = r.kept ? `-${(100 * (1 - r.after / r.before)).toFixed(0)}%` : "unchanged";
  console.log(
    `${pad(r.file, wide)}  ${pad(`${r.w}->${r.newW}`, 12)}  ${pad(kb(r.before), 10)}  ${pad(kb(r.after), 10)}  ${saved}`
  );
}
console.log(
  `\ntotal  ${kb(totalBefore)} -> ${kb(totalAfter)}  (-${(
    100 *
    (1 - totalAfter / totalBefore)
  ).toFixed(1)}%)${DRY ? "  [dry run, nothing written]" : ""}`
);
