/**
 * Static site generation.
 *
 * Runs after:
 *   vite build                                            -> dist/
 *   vite build --ssr src/entry-server.jsx --outDir dist-ssr -> dist-ssr/entry-server.js
 *
 * For every route it renders the app to HTML, injects head + critical emotion
 * CSS + markup into dist/index.html and writes dist/<path>/index.html.
 * Finally writes dist/index.html (the "/" language splash), sitemap.xml and
 * robots.txt, then removes dist-ssr.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveSiteOrigin } from "../site-origin.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const DIST_SSR = path.join(ROOT, "dist-ssr");
const ORIGIN = resolveSiteOrigin();
const LANGS = ["pt", "en", "es", "fr"];
/** Market Brief content exists in PT and EN only. */
const CONTENT_LANGS = ["pt", "en"];

const templatePath = path.join(DIST, "index.html");
if (!fs.existsSync(templatePath)) {
  throw new Error("dist/index.html is missing - run `vite build` first.");
}
const template = fs.readFileSync(templatePath, "utf8");

for (const marker of ["<!--app-head-->", "<!--app-html-->"]) {
  if (!template.includes(marker)) {
    throw new Error(`index.html is missing the ${marker} placeholder.`);
  }
}

const serverEntry = path.join(DIST_SSR, "entry-server.js");
if (!fs.existsSync(serverEntry)) {
  throw new Error("dist-ssr/entry-server.js is missing - run the SSR build first.");
}
const { render, knowledgeCentrePaths } = await import(pathToFileURL(serverEntry).href);

// ---------------------------------------------------------------- route list
// Trailing-slash URLs are canonical: every page lives at <path>/index.html, so
// /pt/market-brief/2026-07/ resolves as a static file on any host.
const withSlash = (route) => (route.endsWith("/") ? route : `${route}/`);

const routes = LANGS.flatMap((lang) => [
  `/${lang}/`,
  ...(knowledgeCentrePaths?.([lang]) ?? []),
]).map(withSlash);

function outputFileFor(route) {
  return path.join(DIST, route.replace(/^\/+/, ""), "index.html");
}

function buildPage(route) {
  const { html, css, head, lang } = render(route);
  // The template keeps a default <title> for `npm run dev`; drop it when the
  // page supplies its own, otherwise the browser would use the template's.
  const shell = head.includes("<title>")
    ? template.replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    : template;
  return shell
    .replace(/(<html[^>]*\blang=")[^"]*(")/i, `$1${lang}$2`)
    .replace("<!--app-head-->", `${head}\n    ${css}`)
    .replace("<!--app-html-->", html);
}

// -------------------------------------------------------------------- render
const written = [];
for (const route of routes) {
  const page = buildPage(route);
  const file = outputFileFor(route);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page, "utf8");
  written.push(route);
  console.log(`prerender  ${route.padEnd(34)} -> ${path.relative(ROOT, file)}`);
}

// ------------------------------------------------------------ 404 page
// Rendered through the catch-all route so the real NotFound markup (bilingual
// PT/EN copy + links to /pt and /en) ships as a static page. Netlify serves
// dist/404.html automatically for any path with no matching file.
const notFound = buildPage("/pt/__not_found__");
fs.writeFileSync(path.join(DIST, "404.html"), notFound, "utf8");
console.log(`prerender  404${" ".repeat(31)} -> dist/404.html`);

// ------------------------------------------- "/" language-detection splash
const splash = `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Paulo Braga Real Estate</title>
    <link rel="canonical" href="${ORIGIN}/pt/" />
${LANGS.map((l) => `    <link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l}/" />`).join("\n")}
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}/pt/" />
    <noscript><meta http-equiv="refresh" content="0;url=/pt/" /></noscript>
    <script>
      (function () {
        try {
          // Served for a real path that is missing its trailing slash (hosts
          // without directory redirects): canonicalise instead of guessing a
          // language, so /pt/market-brief/2026-07 keeps its language.
          var p = location.pathname || "/";
          // (Split rather than a regex: this whole page is built from a JS
          // template literal, where backslash escapes would be eaten.)
          var seg = p.split("/")[1];
          if (seg === "pt" || seg === "en" || seg === "es" || seg === "fr") {
            if (p.charAt(p.length - 1) !== "/") {
              location.replace(p + "/" + location.search + location.hash);
            }
            return;
          }
          // Bare "/": detect the browser language.
          var tags = navigator.languages && navigator.languages.length
            ? navigator.languages
            : [navigator.language || ""];
          var pick = "pt";
          outer: for (var i = 0; i < tags.length; i++) {
            var t = String(tags[i]).toLowerCase();
            var codes = ["es", "fr", "en"];
            for (var j = 0; j < codes.length; j++) {
              if (t.indexOf(codes[j]) === 0) { pick = codes[j]; break outer; }
            }
            if (t.indexOf("pt") === 0) { pick = "pt"; break outer; }
          }
          location.replace("/" + pick + "/");
        } catch (e) {
          location.replace("/pt/");
        }
      })();
    </script>
  </head>
  <body>
    <p><a href="/pt/">Paulo Braga Real Estate</a></p>
  </body>
</html>
`;
fs.writeFileSync(templatePath, splash, "utf8");
console.log(`prerender  /${" ".repeat(33)} -> dist/index.html (language splash)`);

// ------------------------------------------------------------------ sitemap
const sitemapRoutes = written.filter(
  (route) =>
    !route.includes("/market-brief") ||
    CONTENT_LANGS.includes(route.split("/")[1])
);
const today = new Date().toISOString().slice(0, 10);
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NS}">
${sitemapRoutes
  .map(
    (route) =>
      `  <url>\n    <loc>${ORIGIN}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap, "utf8");

fs.writeFileSync(
  path.join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  "utf8"
);

// ------------------------------------------------------------------- cleanup
fs.rmSync(DIST_SSR, { recursive: true, force: true });

console.log(
  `\nprerendered ${written.length} routes, ${sitemapRoutes.length} in sitemap.xml`
);
