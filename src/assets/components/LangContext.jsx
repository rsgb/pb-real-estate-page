import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

/**
 * Language context.
 *
 * Public API (stable contract used across the app):
 *   useLang()        -> { lang, setLang, urlLang }
 *                        lang    ∈ SITE_LANGS  (legacy UPPER-CASE, e.g. "PT")
 *                        urlLang ∈ URL_LANGS   (lower-case, e.g. "pt")
 *   useContentLang() -> "pt" | "en"         language the Brief content is shown in
 *
 * `lang` is derived from the `:lang` URL segment; `setLang(code)` navigates to
 * the same path with the language segment swapped, preserving search + hash.
 * Works under BrowserRouter (client/dev) and StaticRouter (pre-render) alike.
 */

export const SITE_LANGS = ["PT", "EN", "ES", "FR"]; // legacy upper-case codes used by the menu
export const CONTENT_LANGS = ["pt", "en"]; // languages the Brief is authored in
export const URL_LANGS = ["pt", "en", "es", "fr"]; // lower-case codes used in URLs
export const DEFAULT_LANG = "pt";

const LangContext = createContext(undefined);

/** Canonical form: every in-app pathname ends with a slash. */
export function withTrailingSlash(pathname) {
  const p = String(pathname || "/");
  return p.endsWith("/") ? p : `${p}/`;
}

/** Lower-case language code from a pathname, or null when the segment is not a language. */
export function langFromPath(pathname) {
  const segment = String(pathname || "/")
    .split("/")[1]
    ?.toLowerCase();
  return URL_LANGS.includes(segment) ? segment : null;
}

/**
 * Language the site opens in: Portuguese for everyone, D-21.
 *
 * The browser language is deliberately ignored — Paulo's audience is addressed
 * in Portuguese first and switches language explicitly through the menu
 * (`setLang`), which is unaffected by this.
 */
export function preferredLang() {
  return DEFAULT_LANG;
}

export const LangProvider = ({ children, value }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const urlLang = langFromPath(location.pathname) ?? DEFAULT_LANG;
  const lang = urlLang.toUpperCase();

  const setLang = useCallback(
    (next) => {
      const code = String(next).toLowerCase();
      if (!URL_LANGS.includes(code)) return;
      const segments = location.pathname.split("/");
      if (langFromPath(location.pathname)) {
        segments[1] = code;
      } else {
        segments.splice(1, 0, code);
      }
      const pathname = withTrailingSlash(segments.join("/") || `/${code}`);
      // Same page, different language: keep the reader where they were.
      navigate(`${pathname}${location.search}${location.hash}`, {
        state: { preserveScroll: true },
      });
    },
    [location.pathname, location.search, location.hash, navigate]
  );

  const derived = useMemo(
    () => ({ lang, urlLang, setLang }),
    [lang, urlLang, setLang]
  );

  return (
    <LangContext.Provider value={value ?? derived}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext) ?? { lang: "PT", urlLang: DEFAULT_LANG, setLang: () => {} };

/** Brief content is only authored in PT and EN; ES/FR visitors see EN. */
export const toContentLang = (lang) =>
  String(lang).toLowerCase() === "pt" ? "pt" : "en";

export const useContentLang = () => toContentLang(useLang().lang);
