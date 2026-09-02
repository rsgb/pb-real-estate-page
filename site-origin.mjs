/**
 * Resolve the absolute origin used for canonical URLs, hreflang links,
 * Open Graph image URLs and the sitemap.
 *
 * Priority:
 *   1. SITE_ORIGIN            explicit override (local builds, other hosts)
 *   2. Netlify production     URL (the custom domain) when CONTEXT === "production"
 *   3. Netlify previews       DEPLOY_PRIME_URL (deploy-preview / branch URL)
 *   4. fallback               the production domain
 */
export const PRODUCTION_ORIGIN = "https://paulobraga-realestate.pt";

export function resolveSiteOrigin(env = process.env) {
  const strip = (u) => (u ? String(u).replace(/\/+$/, "") : "");
  if (env.SITE_ORIGIN) return strip(env.SITE_ORIGIN);
  if (env.CONTEXT === "production" && env.URL) return strip(env.URL);
  if (env.DEPLOY_PRIME_URL) return strip(env.DEPLOY_PRIME_URL);
  return PRODUCTION_ORIGIN;
}
