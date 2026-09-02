import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolveSiteOrigin } from "./site-origin.mjs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Absolute origin for canonical/og URLs; see site-origin.mjs
    __SITE_ORIGIN__: JSON.stringify(resolveSiteOrigin()),
  },
  // base: "/paulo-braga-real-estate/", // GitHub repo name
  base: "/", // Netlify repo name
  server: {
    host: true,
  },
});
