import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/libre-baskerville/400.css";
import "@fontsource/libre-baskerville/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import theme from "./theme";
import App from "./App.jsx";
import { HeadProvider } from "./lib/head.jsx";

// Same key as src/entry-server.jsx so pre-rendered styles hydrate cleanly.
const cache = createCache({ key: "mui" });

const tree = (
  <StrictMode>
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <HeadProvider>
            <App />
          </HeadProvider>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>
);

const container = document.getElementById("root");

// Production pages ship pre-rendered markup; `npm run dev` serves an empty root.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
