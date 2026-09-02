import { useEffect } from "react";

/**
 * Cookie-free analytics hook.
 *
 * Renders nothing unless VITE_ANALYTICS_SRC is set at build time, in which case
 * the provider script (Umami / Plausible - both accept `data-domain`) is
 * injected once on the client. See .env.example.
 */
const ANALYTICS_SRC = import.meta.env.VITE_ANALYTICS_SRC;
const MARKER = "data-pb-analytics";

export default function Analytics() {
  useEffect(() => {
    if (!ANALYTICS_SRC) return;
    if (typeof document === "undefined") return;
    if (document.querySelector(`script[${MARKER}]`)) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = ANALYTICS_SRC;
    script.setAttribute("data-domain", "paulobraga-realestate.pt");
    script.setAttribute(MARKER, "");
    document.head.appendChild(script);
  }, []);

  return null;
}
