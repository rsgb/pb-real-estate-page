/**
 * Input validation and repo-path construction shared by the publish endpoints.
 *
 * No path handed to GitHub is ever built from raw user input: an id must match
 * EDITION_ID_PATTERN and a filename must be exactly `<id>.json`, which excludes
 * slashes, dots-dots and everything else that could escape the one folder the
 * flow is allowed to write to.
 *
 * Since D-34 that folder really is the only one: the edition PDFs are rendered
 * by the build from the JSON (scripts/render-pdfs.mjs), so `kind` has a single
 * value and nothing the upload flow accepts can ever land in public/briefs.
 * The old `pdf-pt` / `pdf-en` kinds are gone rather than merely unused: a PDF
 * committed to a branch would be a stale file the build might serve instead of
 * the freshly rendered one.
 */
import { EDITION_ID_PATTERN } from "../../../src/lib/edition-validation.mjs";
import { HttpError } from "./http.mjs";
import { BRIEFS_PATH, EDITIONS_PATH } from "./github.mjs";

export const KINDS = ["json"];

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

/** Throw unless `kind` is an accepted upload kind. */
export function assertKind(kind) {
  if (!KINDS.includes(kind)) {
    throw new HttpError(400, "Tipo de ficheiro inválido; use \"json\".");
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

  if (filename !== `${id}.json`) {
    throw new HttpError(400, `O ficheiro JSON tem de se chamar "${id}.json".`);
  }
  return { repoPath: `${EDITIONS_PATH}/${filename}`, filename };
}

/** Repo path of an edition's JSON file. */
export const editionJsonPath = (id) => `${EDITIONS_PATH}/${id}.json`;

/**
 * Where the build writes one brief PDF. Nothing commits to this path any more;
 * it exists so the pull-request body can name the files the deploy preview
 * will serve.
 */
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
