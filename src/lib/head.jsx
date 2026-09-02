import { createContext, useContext, useEffect } from "react";

/**
 * Minimal per-page <head> management that works both during build-time
 * pre-rendering (SSR) and on the client.
 *
 * SSR:  wrap the tree in <HeadProvider collector={[]}> and, after
 *       renderToString, read collector[0] (the last useHead call wins).
 * Client: useHead updates document.title and the relevant <meta>/<link>
 *       tags in an effect.
 *
 * Contract (do not change the shape without updating scripts/prerender.mjs):
 * useHead({
 *   title: string,
 *   description?: string,
 *   lang: "pt" | "en" | "es" | "fr",      // <html lang>
 *   canonical?: string,                   // absolute URL
 *   alternates?: [{ lang: string, href: string }], // hreflang links
 *   og?: { title?: string, description?: string, type?: string,
 *          image?: string, imageWidth?: number, imageHeight?: number, imageAlt?: string },
 *   article?: { author?: string, publishedTime?: string (ISO), modifiedTime?: string, section?: string },
 *   robots?: string,                      // e.g. "noindex"
 * })
 */

// Injected at build time from vite.config.js (see site-origin.mjs):
// production -> custom domain, Netlify deploy previews -> preview URL.
// eslint-disable-next-line no-undef
export const SITE_ORIGIN = typeof __SITE_ORIGIN__ !== "undefined" ? __SITE_ORIGIN__ : "https://paulobraga-realestate.pt";

const HeadContext = createContext(null);

export function HeadProvider({ collector, children }) {
  return (
    <HeadContext.Provider value={collector ?? null}>{children}</HeadContext.Provider>
  );
}

export function useHead(head) {
  const collector = useContext(HeadContext);

  // SSR path: record synchronously during render (effects don't run on the server).
  if (typeof window === "undefined" && collector) {
    collector[0] = head;
  }

  useEffect(() => {
    if (!head) return;
    applyHeadToDocument(head);
  }, [JSON.stringify(head)]); // eslint-disable-line react-hooks/exhaustive-deps
}

function setMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

function applyHeadToDocument(head) {
  if (head.title) document.title = head.title;
  if (head.lang) document.documentElement.lang = head.lang;
  if (head.description) {
    setMeta('meta[name="description"]', { name: "description", content: head.description });
  }
  if (head.robots) {
    setMeta('meta[name="robots"]', { name: "robots", content: head.robots });
  } else {
    document.head.querySelector('meta[name="robots"]')?.remove();
  }
  const og = head.og ?? {};
  setMeta('meta[property="og:title"]', { property: "og:title", content: og.title ?? head.title ?? "" });
  if (og.description ?? head.description) {
    setMeta('meta[property="og:description"]', {
      property: "og:description",
      content: og.description ?? head.description,
    });
  }
  if (og.image) setMeta('meta[property="og:image"]', { property: "og:image", content: og.image });
  if (og.imageWidth) setMeta('meta[property="og:image:width"]', { property: "og:image:width", content: String(og.imageWidth) });
  if (og.imageHeight) setMeta('meta[property="og:image:height"]', { property: "og:image:height", content: String(og.imageHeight) });
  if (og.imageAlt) setMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: og.imageAlt });
  setMeta('meta[property="og:type"]', { property: "og:type", content: og.type ?? "website" });
  const article = head.article ?? {};
  document.head.querySelectorAll('meta[property^="article:"], meta[name="author"]').forEach((m) => m.remove());
  if (article.author) {
    setMeta('meta[name="author"]', { name: "author", content: article.author });
    setMeta('meta[property="article:author"]', { property: "article:author", content: article.author });
  }
  if (article.publishedTime) setMeta('meta[property="article:published_time"]', { property: "article:published_time", content: article.publishedTime });
  if (article.modifiedTime) setMeta('meta[property="article:modified_time"]', { property: "article:modified_time", content: article.modifiedTime });
  if (article.section) setMeta('meta[property="article:section"]', { property: "article:section", content: article.section });
  if (head.canonical) {
    setMeta('meta[property="og:url"]', { property: "og:url", content: head.canonical });
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", head.canonical);
  }
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());
  (head.alternates ?? []).forEach(({ lang, href }) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang);
    link.setAttribute("href", href);
    document.head.appendChild(link);
  });
}

/** Serialise a head object to HTML for injection during pre-rendering. */
export function renderHeadToString(head) {
  if (!head) return "";
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  const og = head.og ?? {};
  const parts = [];
  if (head.title) parts.push(`<title>${esc(head.title)}</title>`);
  if (head.description) parts.push(`<meta name="description" content="${esc(head.description)}">`);
  if (head.robots) parts.push(`<meta name="robots" content="${esc(head.robots)}">`);
  parts.push(`<meta property="og:title" content="${esc(og.title ?? head.title ?? "")}">`);
  if (og.description ?? head.description)
    parts.push(`<meta property="og:description" content="${esc(og.description ?? head.description)}">`);
  if (og.image) parts.push(`<meta property="og:image" content="${esc(og.image)}">`);
  if (og.imageWidth) parts.push(`<meta property="og:image:width" content="${esc(og.imageWidth)}">`);
  if (og.imageHeight) parts.push(`<meta property="og:image:height" content="${esc(og.imageHeight)}">`);
  if (og.imageAlt) parts.push(`<meta property="og:image:alt" content="${esc(og.imageAlt)}">`);
  parts.push(`<meta property="og:type" content="${esc(og.type ?? "website")}">`);
  const article = head.article ?? {};
  if (article.author) {
    parts.push(`<meta name="author" content="${esc(article.author)}">`);
    parts.push(`<meta property="article:author" content="${esc(article.author)}">`);
  }
  if (article.publishedTime) parts.push(`<meta property="article:published_time" content="${esc(article.publishedTime)}">`);
  if (article.modifiedTime) parts.push(`<meta property="article:modified_time" content="${esc(article.modifiedTime)}">`);
  if (article.section) parts.push(`<meta property="article:section" content="${esc(article.section)}">`);
  if (head.canonical) {
    parts.push(`<meta property="og:url" content="${esc(head.canonical)}">`);
    parts.push(`<link rel="canonical" href="${esc(head.canonical)}">`);
  }
  (head.alternates ?? []).forEach(({ lang, href }) =>
    parts.push(`<link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}">`)
  );
  return parts.join("\n    ");
}
