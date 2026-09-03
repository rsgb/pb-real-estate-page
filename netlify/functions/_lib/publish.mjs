/**
 * Input validation and repo-path construction shared by the publish endpoints.
 *
 * No path handed to GitHub is ever built from raw user input: an id must match
 * EDITION_ID_PATTERN and a filename must match either `<id>.json` or the PDF
 * naming pattern, both of which exclude slashes, dots-dots and everything else
 * that could escape the two folders the flow is allowed to write to.
 */
import {
  EDITION_ID_PATTERN,
  PDF_NAME_PATTERN,
} from "../../../src/lib/edition-validation.mjs";
import { HttpError } from "./http.mjs";
import { BRIEFS_PATH, EDITIONS_PATH } from "./github.mjs";

export const KINDS = ["json", "pdf-pt", "pdf-en"];

/** The language a `pdf-*` kind carries. */
const KIND_LANG = { "pdf-pt": "PT", "pdf-en": "EN" };

/** Throw unless `id` is an edition id; returns it unchanged. */
export function assertEditionId(id) {
  if (typeof id !== "string" || !EDITION_ID_PATTERN.test(id)) {
    throw new HttpError(
      400,
      'Identificador de edição inválido; use AAAA, AAAA-MM, AAAA-Qn ou AAAA-Hn (por exemplo "2026-07").'
    );
  }
  return id;
}

/** Throw unless `kind` is one of the three upload kinds. */
export function assertKind(kind) {
  if (!KINDS.includes(kind)) {
    throw new HttpError(400, "Tipo de ficheiro inválido; use \"json\", \"pdf-pt\" ou \"pdf-en\".");
  }
  return kind;
}

/**
 * Validate a filename against its kind and turn it into a repo path.
 * @returns {{repoPath: string, filename: string}}
 */
export function resolveUploadPath({ id, kind, filename }) {
  assertEditionId(id);
  assertKind(kind);

  if (typeof filename !== "string" || filename.length === 0 || filename.length > 120) {
    throw new HttpError(400, "Nome de ficheiro em falta ou demasiado longo.");
  }
  // Belt and braces: the patterns below already exclude these, but a path that
  // is never built from a separator cannot traverse.
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new HttpError(400, "O nome do ficheiro não pode conter caminhos.");
  }

  if (kind === "json") {
    if (filename !== `${id}.json`) {
      throw new HttpError(400, `O ficheiro JSON tem de se chamar "${id}.json".`);
    }
    return { repoPath: `${EDITIONS_PATH}/${filename}`, filename };
  }

  const match = PDF_NAME_PATTERN.exec(filename);
  if (!match) {
    throw new HttpError(
      400,
      `"${filename}" não segue o padrão THB_[Horizonte]_[Periodo]_[Idioma]_PDF_vX.Y.pdf.`
    );
  }
  const [, , periodToken, langToken] = match;
  if (periodToken !== id) {
    throw new HttpError(
      400,
      `O período "${periodToken}" no nome do ficheiro não corresponde à edição "${id}".`
    );
  }
  if (langToken !== KIND_LANG[kind]) {
    throw new HttpError(
      400,
      `O idioma "${langToken}" no nome do ficheiro não corresponde ao PDF em ${
        kind === "pdf-pt" ? "português" : "inglês"
      }.`
    );
  }
  return { repoPath: `${BRIEFS_PATH}/${filename}`, filename };
}

/** Repo path of an edition's JSON file. */
export const editionJsonPath = (id) => `${EDITIONS_PATH}/${id}.json`;

/** Repo path of one brief PDF. */
export const briefPdfPath = (filename) => `${BRIEFS_PATH}/${filename}`;

/** Human period, for the pull-request body. */
export function describePeriod(derived) {
  const { horizon, period } = derived ?? {};
  const year = period?.year ?? "?";
  switch (horizon) {
    case "monthly":
      return `${String(period?.month ?? "?").padStart(2, "0")}/${year}`;
    case "quarterly":
      return `Q${period?.quarter ?? "?"} ${year}`;
    case "half-year":
      return `H${period?.half ?? "?"} ${year}`;
    case "annual":
      return `${year}`;
    default:
      return String(year);
  }
}
