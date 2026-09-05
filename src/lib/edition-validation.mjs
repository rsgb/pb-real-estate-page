/**
 * Validation of one Tourism & Hospitality Brief edition.
 *
 * Pure ESM, no `node:fs`, no globals: the same module runs in the browser
 * (the /publicar page validates before uploading), inside the Netlify
 * functions and in `scripts/validate-editions.mjs`, so Paulo sees exactly the
 * same verdict wherever the file is checked.
 *
 * Everything the reader is shown is in Portuguese and names the JSON path it
 * refers to, e.g.
 *   sections[2].indicators[0].change.unit: valor "ppt" inválido; use "percent", "pp" ou "abs"
 *
 * Rules, in order:
 *   1. JSON Schema 2020-12 (edition.schema.json);
 *   2. id ↔ horizon ↔ period consistency ("2025-03" is month 3 of 2025);
 *   3. takeaway within 45 words per language (Componentes Visuais v0.9 s.4);
 *   4. PT + EN present and non-empty in every localised field (s.6);
 *   5. PDF filenames: pattern, horizon token, period token, language token,
 *      and — when the caller passes `pdfNamesPresent` — actual presence in
 *      public/briefs, which since D-34 only the build checks, after it has
 *      rendered the PDFs from this very JSON.
 * Backfilled editions that are not flagged `historical` produce warnings, not
 * errors: they do not block a build or an upload.
 */
import Ajv2020 from "ajv/dist/2020.js";
import rawSchema from "../content/editions/edition.schema.json" with { type: "json" };

/** Ajv ships as CJS; the interop shape differs between Node, Vite and esbuild. */
const Ajv = Ajv2020.default ?? Ajv2020;

export const EDITION_SCHEMA = rawSchema;

/** Recommended maximum for the executive takeaway (Componentes Visuais v0.9 s.4). */
export const TAKEAWAY_MAX_WORDS = 45;

/**
 * An edition published more than this many days after its period closed is
 * almost certainly part of Paulo's backfill and should carry `historical: true`.
 */
export const HISTORICAL_LAG_DAYS = 120;

const DAY_MS = 24 * 60 * 60 * 1000;
const LANGS = ["pt", "en"];

/** Accepted edition ids: AAAA, AAAA-MM, AAAA-Qn, AAAA-Hn. */
export const EDITION_ID_PATTERN = /^\d{4}(-(0[1-9]|1[0-2])|-Q[1-4]|-H[12])?$/;

/** THB_[Horizonte]_[Periodo]_[Idioma]_PDF_vX.Y.pdf (Sistema Visual v1.0 s.14). */
export const PDF_NAME_PATTERN =
  /^THB_(Monthly|Quarterly|HalfYear|Annual)_([0-9A-Za-z-]+)_(PT|EN)_PDF_v(\d+)\.(\d+)\.pdf$/;

/** Horizon token used in the PDF filename, per editorial horizon. */
export const HORIZON_TOKEN = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-year": "HalfYear",
  annual: "Annual",
};

const TYPE_NAMES = {
  string: "texto",
  number: "número",
  integer: "número inteiro",
  boolean: "booleano",
  object: "objeto",
  array: "lista",
  null: "nulo",
};

/* -------------------------------------------------------------------------- */
/* Paths and message building                                                 */
/* -------------------------------------------------------------------------- */

const unescapePointer = (token) => token.replace(/~1/g, "/").replace(/~0/g, "~");

/**
 * JSON Pointer -> the dotted path Paulo sees.
 * "/sections/2/indicators/0/change/unit" -> "sections[2].indicators[0].change.unit"
 */
export function jsonPath(pointer) {
  if (!pointer) return "$";
  let out = "";
  for (const token of pointer.split("/").slice(1).map(unescapePointer)) {
    if (/^\d+$/.test(token)) out += `[${token}]`;
    else out += out ? `.${token}` : token;
  }
  return out || "$";
}

/** Value at a JSON Pointer, or undefined. */
function atPointer(data, pointer) {
  if (!pointer) return data;
  let node = data;
  for (const token of pointer.split("/").slice(1).map(unescapePointer)) {
    if (node === null || typeof node !== "object") return undefined;
    node = node[token];
  }
  return node;
}

/** Short, quoted rendering of a value for an error message. */
function show(value) {
  if (typeof value === "string") return `"${value}"`;
  if (value === undefined) return "(em falta)";
  if (value === null) return "nulo";
  if (typeof value === "object") return Array.isArray(value) ? "(lista)" : "(objeto)";
  return String(value);
}

/** `"a", "b" ou "c"` — the wording used for every enum in this module. */
function quoteList(values) {
  const quoted = (values ?? []).map((v) => `"${v}"`);
  if (quoted.length <= 1) return quoted.join("");
  return `${quoted.slice(0, -1).join(", ")} ou ${quoted[quoted.length - 1]}`;
}

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

let compiled = null;

/**
 * Compile the edition schema once per process.
 *
 * Ajv generates validation code with `new Function`. That is allowed in Node,
 * in the Netlify (Lambda) runtime and in the browser; it would only fail behind
 * a Content-Security-Policy without 'unsafe-eval', and the site sets no CSP.
 */
function schemaValidator() {
  if (!compiled) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addFormat("date", /^\d{4}-\d{2}-\d{2}$/);
    compiled = ajv.compile(EDITION_SCHEMA);
  }
  return compiled;
}

/** One Ajv error as a Portuguese sentence prefixed by its JSON path. */
function schemaMessage(error, data) {
  const path = jsonPath(error.instancePath);
  const value = atPointer(data, error.instancePath);
  const { params = {} } = error;

  switch (error.keyword) {
    case "required":
      return `${path}: falta a propriedade obrigatória "${params.missingProperty}"`;
    case "additionalProperties":
      return `${path}: a propriedade "${params.additionalProperty}" não é reconhecida`;
    case "enum":
      return `${path}: valor ${show(value)} inválido; use ${quoteList(params.allowedValues)}`;
    case "const":
      return `${path}: valor ${show(value)} inválido; use "${params.allowedValue}"`;
    case "type":
      return `${path}: deve ser ${TYPE_NAMES[params.type] ?? params.type}`;
    case "pattern":
      return `${path}: valor ${show(value)} não respeita o formato exigido (${params.pattern})`;
    case "format":
      return `${path}: valor ${show(value)} não é uma data válida (AAAA-MM-DD)`;
    case "minLength":
      return params.limit === 1
        ? `${path}: não pode estar vazio`
        : `${path}: deve ter pelo menos ${params.limit} caracteres`;
    case "maxLength":
      return `${path}: deve ter no máximo ${params.limit} caracteres`;
    case "minItems":
      return `${path}: deve ter pelo menos ${params.limit} elemento(s)`;
    case "maxItems":
      return `${path}: deve ter no máximo ${params.limit} elemento(s)`;
    case "minimum":
      return `${path}: deve ser maior ou igual a ${params.limit}`;
    case "maximum":
      return `${path}: deve ser menor ou igual a ${params.limit}`;
    case "false schema":
      return `${path}: não é permitido neste ponto`;
    default:
      return `${path}: ${error.message ?? error.keyword}`;
  }
}

/* -------------------------------------------------------------------------- */
/* Individual rules                                                           */
/* -------------------------------------------------------------------------- */

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

/** True for a localised `{ pt, en }` container (strings or paragraph arrays). */
function isLocalized(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => LANGS.includes(key));
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmpty);
  return false;
}

/** Depth-first walk asserting both languages are present and non-empty. */
function checkLocalized(value, push, trail = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkLocalized(item, push, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;

  if (isLocalized(value)) {
    for (const lang of LANGS) {
      if (!(lang in value)) push(`${trail}: falta a versão "${lang}"`);
      else if (isEmpty(value[lang])) push(`${trail}.${lang}: está vazio`);
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    checkLocalized(child, push, trail === "$" ? key : `${trail}.${key}`);
  }
}

/** The horizon an id implies, e.g. "2025-Q1" -> "quarterly". */
export function horizonFromId(id) {
  const match = /^(\d{4})(?:-(0[1-9]|1[0-2])|-Q([1-4])|-H([12]))?$/.exec(String(id ?? ""));
  if (!match) return null;
  const [, , month, quarter, half] = match;
  if (month) return "monthly";
  if (quarter) return "quarterly";
  if (half) return "half-year";
  return "annual";
}

/** id ⇔ horizon ⇔ period. "2025-03" is month 3 of 2025 and nothing else. */
function checkIdPeriod(edition, push) {
  const id = edition.id;
  if (typeof id !== "string") return; // the schema already reported it
  const match = /^(\d{4})(?:-(0[1-9]|1[0-2])|-Q([1-4])|-H([12]))?$/.exec(id);
  if (!match) {
    push(`id: "${id}" não é um identificador válido (use AAAA, AAAA-MM, AAAA-Qn ou AAAA-Hn)`);
    return;
  }
  const [, yearToken, monthToken, quarterToken, halfToken] = match;
  const year = Number(yearToken);
  const horizon = horizonFromId(id);

  if (edition.horizon && edition.horizon !== horizon) {
    push(`horizon: "${edition.horizon}" não corresponde ao id "${id}" (esperado "${horizon}")`);
  }

  const period = edition.period;
  if (!period || typeof period !== "object") return; // the schema already reported it

  if (period.year !== undefined && period.year !== year) {
    push(`period.year: ${period.year} não corresponde ao id "${id}" (esperado ${year})`);
  }

  /** @param {string} key @param {number|undefined} expected */
  const expect = (key, expected) => {
    const actual = period[key];
    if (expected === undefined) {
      if (actual !== undefined) {
        push(`period.${key}: não se aplica ao id "${id}" (horizonte "${horizon}")`);
      }
      return;
    }
    if (actual === undefined) {
      push(`period.${key}: em falta; o id "${id}" indica ${expected}`);
    } else if (actual !== expected) {
      push(`period.${key}: ${actual} não corresponde ao id "${id}" (esperado ${expected})`);
    }
  };

  expect("month", monthToken ? Number(monthToken) : undefined);
  expect("quarter", quarterToken ? Number(quarterToken) : undefined);
  expect("half", halfToken ? Number(halfToken) : undefined);
}

/** Filename each language's PDF must carry, or null when it cannot be derived. */
export function expectedPdfName(edition, lang, version = "1.0") {
  const token = HORIZON_TOKEN[edition?.horizon];
  if (!token || !edition?.id) return null;
  return `THB_${token}_${edition.id}_${lang.toUpperCase()}_PDF_v${version}.pdf`;
}

/** PDF filename pattern plus the horizon / period / language tokens inside it. */
function checkPdfNames(edition, push, pdfNamesPresent) {
  const pdf = edition.pdf;
  if (!pdf || typeof pdf !== "object") return; // the schema already reported it

  for (const lang of LANGS) {
    const path = `pdf.${lang}`;
    const name = pdf[lang];
    if (typeof name !== "string" || !name) continue; // schema territory

    const match = PDF_NAME_PATTERN.exec(name);
    if (!match) {
      push(
        `${path}: "${name}" não segue o padrão ` +
          `THB_[Horizonte]_[Periodo]_[Idioma]_PDF_vX.Y.pdf`
      );
      continue;
    }
    const [, horizonToken, periodToken, langToken] = match;

    const wanted = HORIZON_TOKEN[edition.horizon];
    if (wanted && horizonToken !== wanted) {
      push(
        `${path}: o horizonte "${horizonToken}" no nome do ficheiro não corresponde a ` +
          `horizon "${edition.horizon}" (esperado "${wanted}")`
      );
    }
    if (typeof edition.id === "string" && periodToken !== edition.id) {
      push(
        `${path}: o período "${periodToken}" no nome do ficheiro não corresponde ao id "${edition.id}"`
      );
    }
    if (langToken !== lang.toUpperCase()) {
      push(`${path}: o idioma "${langToken}" no nome do ficheiro deveria ser "${lang.toUpperCase()}"`);
    }
  }

  if (pdf.pt && pdf.en && pdf.pt === pdf.en) {
    push(`pdf.en: é o mesmo ficheiro de pdf.pt ("${pdf.en}"); cada idioma tem o seu PDF`);
  }

  if (Array.isArray(pdfNamesPresent)) {
    for (const lang of LANGS) {
      const name = pdf[lang];
      if (typeof name === "string" && name && !pdfNamesPresent.includes(name)) {
        push(`pdf.${lang}: o ficheiro "${name}" não foi encontrado`);
      }
    }
  }
}

/**
 * Last calendar day of the edition's reference period, as a UTC timestamp.
 * @returns {number|null} null when the period is incomplete for its horizon.
 */
function periodEnd(edition) {
  const { year, month, quarter, half } = edition.period ?? {};
  if (!year) return null;
  let lastMonth;
  switch (edition.horizon) {
    case "monthly":
      lastMonth = month;
      break;
    case "quarterly":
      lastMonth = quarter ? quarter * 3 : undefined;
      break;
    case "half-year":
      lastMonth = half ? half * 6 : undefined;
      break;
    case "annual":
      lastMonth = 12;
      break;
    default:
      return null;
  }
  if (!lastMonth) return null;
  // Day 0 of the following month is the last day of `lastMonth`.
  return Date.UTC(year, lastMonth, 0);
}

/** Days between the close of the period and the publication date. */
export function publicationLagDays(edition) {
  const end = periodEnd(edition);
  if (end === null) return null;
  const [y, m, d] = String(edition.publishedAt ?? "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return Math.round((Date.UTC(y, m - 1, d) - end) / DAY_MS);
}

/* -------------------------------------------------------------------------- */
/* Versions                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Compare two `major.minor` version strings.
 * @returns {number} negative when a < b, 0 when equal, positive when a > b.
 */
export function compareVersions(a, b) {
  const parse = (v) => String(v ?? "").split(".").map((n) => Number(n) || 0);
  const [aMajor = 0, aMinor = 0] = parse(a);
  const [bMajor = 0, bMinor = 0] = parse(b);
  return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
}

/* -------------------------------------------------------------------------- */
/* Public entry point                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Validate one edition object.
 *
 * @param {unknown} json parsed edition JSON
 * @param {{pdfNamesPresent?: string[]}} [options]
 *   `pdfNamesPresent` — the PDF basenames known to exist in public/briefs.
 *   Omit to skip the check, which is what almost every caller now does: since
 *   D-34 the PDFs are generated by the build (`scripts/render-pdfs.mjs`, from
 *   `pdf.pt` / `pdf.en`) and are neither committed nor uploaded, so the only
 *   place the file has to be on disk is the second validation pass of
 *   `prebuild`, after rendering — there the check proves the renderer wrote
 *   every declared name. The naming rules above are checked either way.
 * @returns {{errors: string[], warnings: string[], derived: {
 *   id: string|null, pdfNames: {pt: string|null, en: string|null},
 *   title: string|null, horizon: string|null, period: object|null,
 *   historical: boolean, version: string|null }}}
 */
export function validateEdition(json, options = {}) {
  const errors = [];
  const warnings = [];
  const pushError = (message) => errors.push(message);

  const empty = {
    id: null,
    pdfNames: { pt: null, en: null },
    title: null,
    horizon: null,
    period: null,
    historical: false,
    version: null,
  };

  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    return {
      errors: ["$: o conteúdo não é um objeto JSON de edição"],
      warnings,
      derived: empty,
    };
  }

  const edition = json;

  // 1. Schema.
  const validate = schemaValidator();
  if (!validate(edition)) {
    for (const error of validate.errors ?? []) pushError(schemaMessage(error, edition));
  }

  // 2. id ⇔ horizon ⇔ period.
  checkIdPeriod(edition, pushError);

  // 3. Takeaway length.
  for (const lang of LANGS) {
    const text = edition.takeaway?.[lang];
    if (typeof text === "string") {
      const words = countWords(text);
      if (words > TAKEAWAY_MAX_WORDS) {
        pushError(
          `takeaway.${lang}: tem ${words} palavras (máximo ${TAKEAWAY_MAX_WORDS})`
        );
      }
    }
  }

  // 4. Bilingual completeness.
  checkLocalized(edition, pushError);

  // 5. PDF filenames.
  checkPdfNames(edition, pushError, options.pdfNamesPresent);

  // Non-fatal: backfilled editions must be marked, so readers are not misled
  // into taking an old period for current reporting.
  if (edition.historical !== true) {
    const lag = publicationLagDays(edition);
    if (lag !== null && lag > HISTORICAL_LAG_DAYS) {
      warnings.push(
        `publishedAt: está ${lag} dias depois do fim do período ` +
          `(mais de ${HISTORICAL_LAG_DAYS}) — considere "historical": true`
      );
    }
    if (edition.historicalNote) {
      warnings.push(
        `historicalNote: está definido sem "historical": true — a nota não será mostrada`
      );
    }
  }

  const unique = (list) => [...new Set(list)];

  return {
    errors: unique(errors),
    warnings: unique(warnings),
    derived: {
      id: typeof edition.id === "string" ? edition.id : null,
      pdfNames: {
        pt: typeof edition.pdf?.pt === "string" ? edition.pdf.pt : null,
        en: typeof edition.pdf?.en === "string" ? edition.pdf.en : null,
      },
      title:
        (typeof edition.title?.pt === "string" ? edition.title.pt : null) ??
        (typeof edition.title?.en === "string" ? edition.title.en : null),
      horizon: typeof edition.horizon === "string" ? edition.horizon : null,
      period: edition.period && typeof edition.period === "object" ? edition.period : null,
      historical: edition.historical === true,
      version: typeof edition.version === "string" ? edition.version : null,
    },
  };
}

export default validateEdition;
