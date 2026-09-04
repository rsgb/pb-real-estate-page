/**
 * Locale formatting for Tourism & Hospitality Brief content.
 *
 * The edition JSON stores raw numbers plus unit/scale/decimals metadata; this
 * module is the single place that turns them into PT or EN display strings.
 * Dependency-free ESM so it can also run under plain `node src/lib/format.js`
 * (the self-check at the bottom).
 *
 * Rules (Sistema Visual v1.0 s.11, Componentes Visuais v0.9 s.4/s.6):
 *   count  + million  -> "9,6 M"        / "9.6 M"
 *   eur    + million  -> "923,7 M EUR"  / "EUR 923.7 M"
 *   eur    + none     -> "154,9 EUR"    / "EUR 154.9"
 *   percent           -> "67,3%"        / "67.3%"
 *   change percent    -> "+1,0%"        / "+1.0%"      (sign always explicit)
 *   change pp         -> "-0,9 p.p."    / "-0.9 pp"
 *
 * Direction of change is carried by the sign and by the basis wording, never
 * by colour alone (Sistema Visual v1.0 s.13).
 */

const LOCALES = { pt: "pt-PT", en: "en-GB" };

/** @param {"pt"|"en"} contentLang */
const locale = (contentLang) => LOCALES[contentLang] ?? LOCALES.en;

const BASIS_LABELS = {
  yoy: { pt: "homólogo", en: "YoY" },
  mom: { pt: "mensal", en: "MoM" },
  ytd: { pt: "acumulado", en: "YTD" },
};

const SCALE_SUFFIX = {
  none: { pt: "", en: "" },
  thousand: { pt: "mil", en: "k" },
  million: { pt: "M", en: "M" },
};

const PP_SUFFIX = { pt: "p.p.", en: "pp" };

const MONTHS = {
  pt: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

/**
 * URL segment for an edition, i.e. its id lower-cased.
 *
 * Edition ids keep the uppercase period token ("2025-Q4", "2026-H1") because it
 * is the same token the PDF file names and the schema pattern use. URLs cannot:
 * Netlify answers any path containing an uppercase letter with a 301 to the
 * lower-cased path, so `/en/market-brief/2025-Q4/` becomes
 * `/en/market-brief/2025-q4/` before the app ever runs. Every path, sitemap
 * entry, pre-render folder and Open Graph file name is therefore built from the
 * slug, and `getEdition` looks editions up case-insensitively so the old
 * uppercase links still resolve.
 *
 * @param {string} id edition id, e.g. "2025-Q4"
 * @returns {string} e.g. "2025-q4"
 */
export function editionSlug(id) {
  return String(id ?? "").toLowerCase();
}

/** Comparison-basis caption, e.g. "homólogo" / "YoY". */
export function basisLabel(basis, contentLang) {
  return BASIS_LABELS[basis]?.[contentLang] ?? BASIS_LABELS[basis]?.en ?? "";
}

/**
 * Low-level number renderer.
 * @param {number} value
 * @param {{unit?: string, scale?: string, decimals?: number, signed?: boolean}} opts
 * @param {"pt"|"en"} contentLang
 */
export function formatNumber(value, opts = {}, contentLang = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const lang = contentLang === "pt" ? "pt" : "en";
  const { unit = "count", scale = "none", decimals = 1, signed = false } = opts;
  const digits = Math.min(Math.max(Number(decimals) || 0, 0), 3);

  const number = new Intl.NumberFormat(locale(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value);

  const suffix = SCALE_SUFFIX[scale]?.[lang] ?? "";

  switch (unit) {
    case "percent":
      return `${number}%`;
    case "pp":
      return `${number} ${PP_SUFFIX[lang]}`;
    case "eur":
      return lang === "pt"
        ? `${number}${suffix ? ` ${suffix}` : ""} EUR`
        : `EUR ${number}${suffix ? ` ${suffix}` : ""}`;
    default:
      // count, index, ratio
      return `${number}${suffix ? ` ${suffix}` : ""}`;
  }
}

/**
 * Headline value of an indicator (or of a table cell, when passed
 * `{ value, ...column }`). When `valueBasis` is not "level" the value is itself
 * a comparison, so the sign is rendered explicitly.
 * @returns {string}
 */
export function formatValue(indicator, contentLang = "en") {
  if (!indicator) return "—";
  const isComparison = indicator.valueBasis && indicator.valueBasis !== "level";
  return formatNumber(
    indicator.value,
    {
      unit: indicator.unit,
      scale: indicator.scale,
      decimals: indicator.decimals,
      signed: Boolean(indicator.signed ?? isComparison),
    },
    contentLang
  );
}

/**
 * Comparison line of an indicator.
 * Returns the parts as well as the joined text so components can render the
 * value and the basis caption with different type without re-parsing a string.
 * @returns {{value: string, basis: string, text: string, direction: -1|0|1}|null}
 */
export function formatChange(change, contentLang = "en") {
  if (!change || typeof change.value !== "number") return null;
  const lang = contentLang === "pt" ? "pt" : "en";
  const unit = change.unit === "abs" ? (change.absUnit ?? "count") : change.unit;
  const value = formatNumber(
    change.value,
    {
      unit,
      scale: change.scale ?? "none",
      decimals: change.decimals ?? 1,
      signed: true,
    },
    lang
  );
  const basis = change.label?.[lang] ?? basisLabel(change.basis, lang);
  return {
    value,
    basis,
    text: basis ? `${value} ${basis}` : value,
    direction: Math.sign(change.value),
  };
}

/** "Julho 2026" / "July 2026", "Q3 2026", "H1 2026", "Balanço Anual 2026". */
export function formatPeriod(edition, contentLang = "en") {
  if (!edition?.period) return "";
  const lang = contentLang === "pt" ? "pt" : "en";
  const { year, month, quarter, half } = edition.period;
  switch (edition.horizon) {
    case "monthly":
      return `${MONTHS[lang][(month ?? 1) - 1]} ${year}`;
    case "quarterly":
      return `Q${quarter ?? 1} ${year}`;
    case "half-year":
      return `H${half ?? 1} ${year}`;
    case "annual":
      return lang === "pt" ? `Balanço Anual ${year}` : `Annual Review ${year}`;
    default:
      return String(year);
  }
}

/**
 * The period as it reads *inside* a sentence rather than as a title:
 * "novembro de 2025" / "November 2025", "1.º trimestre de 2025" / "Q1 2025",
 * "1.º semestre de 2025" / "H1 2025", "2025" / "2025".
 *
 * `formatPeriod` is the display label (page heading, archive rows, cards), so
 * it is title-cased and spells the annual edition out as "Balanço Anual 2026".
 * Dropped mid-sentence that reads wrong in Portuguese, which is why the
 * historical notice uses this form instead.
 */
export function formatPeriodInSentence(edition, contentLang = "en") {
  if (!edition?.period) return "";
  const lang = contentLang === "pt" ? "pt" : "en";
  const { year, month, quarter, half } = edition.period;
  switch (edition.horizon) {
    case "monthly": {
      const name = MONTHS[lang][(month ?? 1) - 1];
      return lang === "pt" ? `${name.toLowerCase()} de ${year}` : `${name} ${year}`;
    }
    case "quarterly":
      return lang === "pt"
        ? `${quarter ?? 1}.º trimestre de ${year}`
        : `Q${quarter ?? 1} ${year}`;
    case "half-year":
      return lang === "pt" ? `${half ?? 1}.º semestre de ${year}` : `H${half ?? 1} ${year}`;
    default:
      // annual, and anything without a narrower period: the year alone
      return String(year);
  }
}

/** "Tourism & Hospitality Brief | Portugal | Julho 2026". */
export function editionTitle(edition, contentLang = "en") {
  if (!edition) return "Tourism & Hospitality Brief";
  const stored = edition.title?.[contentLang === "pt" ? "pt" : "en"];
  if (stored) return stored;
  return `Tourism & Hospitality Brief | Portugal | ${formatPeriod(edition, contentLang)}`;
}

/** ISO date -> "1 de setembro de 2026" / "1 September 2026". */
export function formatDate(iso, contentLang = "en") {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return String(iso);
  return new Intl.DateTimeFormat(locale(contentLang === "pt" ? "pt" : "en"), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/**
 * Short unit token for a table column header, e.g. "%", "p.p.", "EUR M".
 * Sistema Visual v1.0 s.11: units belong in the header, not in every cell.
 */
export function unitLabel({ unit, scale } = {}, contentLang = "en") {
  const lang = contentLang === "pt" ? "pt" : "en";
  const scaleToken = SCALE_SUFFIX[scale]?.[lang] ?? "";
  switch (unit) {
    case "percent":
      return "%";
    case "pp":
      return PP_SUFFIX[lang];
    case "eur":
      return lang === "pt"
        ? [scaleToken, "EUR"].filter(Boolean).join(" ")
        : ["EUR", scaleToken].filter(Boolean).join(" ");
    default:
      return scaleToken;
  }
}

/* -------------------------------------------------------------------------- */
/* Self-check: `node src/lib/format.js`                                       */
/* -------------------------------------------------------------------------- */

const argv1 = globalThis.process?.argv?.[1];
if (argv1 && argv1.replace(/\\/g, "/").endsWith("src/lib/format.js")) {
  const nbsp = (s) => s.replace(/ | /g, " ");
  const cases = [
    [formatValue({ value: 9.607, unit: "count", scale: "million", decimals: 1 }, "pt"), "9,6 M"],
    [formatValue({ value: 9.607, unit: "count", scale: "million", decimals: 1 }, "en"), "9.6 M"],
    [formatValue({ value: 923.7, unit: "eur", scale: "million", decimals: 1 }, "pt"), "923,7 M EUR"],
    [formatValue({ value: 923.7, unit: "eur", scale: "million", decimals: 1 }, "en"), "EUR 923.7 M"],
    [formatValue({ value: 154.9, unit: "eur", scale: "none", decimals: 1 }, "pt"), "154,9 EUR"],
    [formatValue({ value: 154.9, unit: "eur", scale: "none", decimals: 1 }, "en"), "EUR 154.9"],
    [formatValue({ value: 67.3, unit: "percent", scale: "none", decimals: 1 }, "pt"), "67,3%"],
    [formatValue({ value: 67.3, unit: "percent", scale: "none", decimals: 1 }, "en"), "67.3%"],
    [formatValue({ value: 0.4, unit: "percent", scale: "none", decimals: 1, valueBasis: "yoy" }, "pt"), "+0,4%"],
    [formatChange({ value: 1.0, unit: "percent", basis: "yoy" }, "pt").text, "+1,0% homólogo"],
    [formatChange({ value: 1.0, unit: "percent", basis: "yoy" }, "en").text, "+1.0% YoY"],
    [formatChange({ value: -0.9, unit: "pp", basis: "yoy" }, "pt").value, "-0,9 p.p."],
    [formatChange({ value: -0.9, unit: "pp", basis: "yoy" }, "en").value, "-0.9 pp"],
    [formatChange({ value: 2.1, unit: "percent", basis: "mom" }, "pt").basis, "mensal"],
    [formatChange({ value: 2.1, unit: "percent", basis: "ytd" }, "en").basis, "YTD"],
    [formatPeriod({ horizon: "monthly", period: { year: 2026, month: 7 } }, "pt"), "Julho 2026"],
    [formatPeriod({ horizon: "monthly", period: { year: 2026, month: 7 } }, "en"), "July 2026"],
    [formatPeriod({ horizon: "quarterly", period: { year: 2026, quarter: 3 } }, "en"), "Q3 2026"],
    [formatPeriod({ horizon: "half-year", period: { year: 2026, half: 1 } }, "pt"), "H1 2026"],
    [formatPeriod({ horizon: "annual", period: { year: 2026 } }, "pt"), "Balanço Anual 2026"],
    [formatPeriod({ horizon: "annual", period: { year: 2026 } }, "en"), "Annual Review 2026"],
    [
      formatPeriodInSentence({ horizon: "monthly", period: { year: 2025, month: 11 } }, "pt"),
      "novembro de 2025",
    ],
    [
      formatPeriodInSentence({ horizon: "monthly", period: { year: 2025, month: 11 } }, "en"),
      "November 2025",
    ],
    [
      formatPeriodInSentence({ horizon: "monthly", period: { year: 2025, month: 3 } }, "pt"),
      "março de 2025",
    ],
    [
      formatPeriodInSentence({ horizon: "quarterly", period: { year: 2025, quarter: 1 } }, "pt"),
      "1.º trimestre de 2025",
    ],
    [
      formatPeriodInSentence({ horizon: "quarterly", period: { year: 2025, quarter: 1 } }, "en"),
      "Q1 2025",
    ],
    [
      formatPeriodInSentence({ horizon: "half-year", period: { year: 2025, half: 2 } }, "pt"),
      "2.º semestre de 2025",
    ],
    [
      formatPeriodInSentence({ horizon: "half-year", period: { year: 2025, half: 2 } }, "en"),
      "H2 2025",
    ],
    [formatPeriodInSentence({ horizon: "annual", period: { year: 2025 } }, "pt"), "2025"],
    [formatPeriodInSentence({ horizon: "annual", period: { year: 2025 } }, "en"), "2025"],
    [
      editionTitle({ horizon: "monthly", period: { year: 2026, month: 7 } }, "en"),
      "Tourism & Hospitality Brief | Portugal | July 2026",
    ],
    [editionSlug("2025-Q4"), "2025-q4"],
    [editionSlug("2026-H1"), "2026-h1"],
    [editionSlug("2026-07"), "2026-07"],
    [editionSlug("2025"), "2025"],
  ];
  let failed = 0;
  for (const [got, want] of cases) {
    if (nbsp(String(got)) !== want) {
      failed += 1;
      console.error(`  FAIL  got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
    }
  }
  if (failed) {
    console.error(`format.js self-check: ${failed}/${cases.length} failed`);
    globalThis.process.exitCode = 1;
  } else {
    console.log(`format.js self-check: ${cases.length}/${cases.length} passed`);
  }
}
