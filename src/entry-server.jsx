import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./theme";
import App from "./App.jsx";
import { HeadProvider, renderHeadToString } from "./lib/head.jsx";
import { langFromPath, DEFAULT_LANG } from "./assets/components/LangContext";

// Re-exported so scripts/prerender.mjs gets the route list from the built
// SSR bundle instead of parsing JSX itself.
export { knowledgeCentrePaths } from "./knowledge-centre/index.jsx";
export { URL_LANGS } from "./assets/components/LangContext";

/**
 * Render one route to static HTML.
 * @param {string} url absolute path, e.g. "/pt/market-brief"
 * @returns {{ html: string, css: string, head: string, lang: string }}
 */
export function render(url) {
  const cache = createCache({ key: "mui" });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache);

  const collector = [];

  const html = renderToString(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StaticRouter location={url}>
          <HeadProvider collector={collector}>
            <App />
          </HeadProvider>
        </StaticRouter>
      </ThemeProvider>
    </CacheProvider>
  );

  // extractCriticalToChunks returns { html, styles }; that object is exactly
  // what constructStyleTagsFromChunks expects.
  const critical = extractCriticalToChunks(html);
  const css = constructStyleTagsFromChunks(critical);
  const head = renderHeadToString(collector[0]);
  const lang = collector[0]?.lang || langFromPath(url) || DEFAULT_LANG;

  return { html, css, head, lang };
}
