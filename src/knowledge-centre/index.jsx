/**
 * Public surface of the Knowledge Centre: the routes component, the route
 * manifest used by the pre-render step, and the theme re-export — one import
 * for the routing/SSR side of the work. Splitting them would break that
 * contract, so Fast Refresh's one-export-kind-per-file rule is waived here.
 */
/* eslint-disable react-refresh/only-export-components */
import { Route, Routes } from "react-router";
import { URL_LANGS } from "../assets/components/LangContext";
import { getEditions } from "../content/editions";
import EditionPage from "./pages/EditionPage";
import MethodologyPage from "./pages/MethodologyPage";
import SeriesPage from "./pages/SeriesPage";

export { thbTheme, THB_COLORS, READING_WIDTH } from "./theme";

/**
 * Mounted by App at "/:lang/market-brief/*", so every path here is relative.
 * The catch-all renders the edition page, which shows its own "edition not
 * found" state for an unknown id.
 */
export function KnowledgeCentreRoutes() {
  return (
    <Routes>
      <Route path="" element={<SeriesPage />} />
      <Route path="methodology" element={<MethodologyPage />} />
      <Route path=":editionId" element={<EditionPage />} />
      <Route path="*" element={<EditionPage />} />
    </Routes>
  );
}

/**
 * Every Market Brief URL, for the static pre-render manifest.
 * @param {string[]} langs lower-case URL language codes
 * @returns {string[]} absolute site paths, trailing slash included,
 *   e.g. "/pt/market-brief/2026-07/"
 */
export function knowledgeCentrePaths(langs = URL_LANGS) {
  const editions = getEditions();
  return langs.flatMap((lang) => {
    const base = `/${String(lang).toLowerCase()}/market-brief/`;
    return [base, `${base}methodology/`, ...editions.map((edition) => `${base}${edition.id}/`)];
  });
}

export default KnowledgeCentreRoutes;
