import { useLang, toContentLang } from "../assets/components/LangContext";
import { contentUi, languageNotice } from "../content/ui";

/**
 * Language helpers for the Knowledge Centre.
 *
 * The site has four languages; the Brief is authored in two. Everything inside
 * a Knowledge Centre page - chips, section labels, card labels, buttons,
 * navigation - follows the CONTENT language, so an ES or FR visitor reads an
 * English edition framed by English labels rather than a Spanish chip on an
 * English sentence. The only string in the visitor's own language is the
 * LangNotice banner, which explains why (Componentes Visuais v0.9 s.6).
 */

/** Read a `{ pt, en }` field. Plain strings pass through unchanged. */
export function pick(localized, contentLang = "en") {
  if (localized == null) return "";
  if (typeof localized === "string") return localized;
  return localized[contentLang] ?? localized.en ?? localized.pt ?? "";
}

/** Read a `{ pt: string[], en: string[] }` field. */
export function pickList(localized, contentLang = "en") {
  if (!localized) return [];
  const list = localized[contentLang] ?? localized.en ?? localized.pt ?? [];
  return Array.isArray(list) ? list : [list];
}

/**
 * Fill `{name}` placeholders in a UI string, e.g.
 * `fillTemplate(t.historicalNotice, { date, period })`. Unknown placeholders
 * are left untouched so a missing value is visible rather than silently blank.
 * @param {string} template
 * @param {Record<string, string>} values
 */
export function fillTemplate(template, values = {}) {
  if (!template) return "";
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    key in values && values[key] != null ? String(values[key]) : match
  );
}

/**
 * @returns {{siteLang: string, urlLang: string, contentLang: "pt"|"en", t: object, notice: string|null, isTranslated: boolean}}
 *   `t`      every Knowledge Centre string, in the content language
 *   `notice` the ES/FR banner text, in the site language; null for PT/EN
 *   `isTranslated` false for ES/FR, which read the English edition
 */
export function useThbLang() {
  const { lang, urlLang } = useLang();
  const siteLang = lang ?? "PT";
  const contentLang = toContentLang(siteLang);
  const isTranslated = ["PT", "EN"].includes(String(siteLang).toUpperCase());
  return {
    siteLang,
    urlLang: urlLang ?? String(siteLang).toLowerCase(),
    contentLang,
    t: contentUi(contentLang),
    notice: isTranslated ? null : languageNotice(siteLang),
    isTranslated,
  };
}
