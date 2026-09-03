/**
 * POST /.netlify/functions/publish-upload   (session required)
 *
 * Body:    { id, kind: "json"|"pdf-pt"|"pdf-en", filename, contentBase64 }
 * Returns: 200 { ok: true, path, commitSha, branch, created }
 *
 * Writes one file to the edition's branch, creating `edition/<id>` from `main`
 * the first time. Idempotent: uploading the same file again replaces it using
 * the sha it already has on the branch, which is what makes «Tentar de novo»
 * safe after a half-finished upload.
 */
import { validateEdition } from "../../src/lib/edition-validation.mjs";
import { requireSession } from "./_lib/auth.mjs";
import { BASE_BRANCH, branchFor, createGitHubClient } from "./_lib/github.mjs";
import {
  HttpError,
  MAX_PDF_BYTES,
  decodeBase64,
  handle,
  json,
  readJsonBody,
  requireEnv,
} from "./_lib/http.mjs";
import { assertEditionId, assertKind, resolveUploadPath } from "./_lib/publish.mjs";

/** A JSON file that large is not an edition; it is a mistake. */
const MAX_JSON_BYTES = 1024 * 1024;

export async function run(event, deps = {}) {
  const env = deps.env ?? process.env;
  const body = readJsonBody(event);
  requireSession(event, env);

  const id = assertEditionId(body.id);
  const kind = assertKind(body.kind);
  const { repoPath, filename } = resolveUploadPath({ id, kind, filename: body.filename });

  const buffer = decodeBase64(body.contentBase64, kind === "json" ? "ficheiro JSON" : "PDF");

  if (kind === "json") {
    if (buffer.length > MAX_JSON_BYTES) {
      throw new HttpError(413, "O ficheiro JSON é demasiado grande (máximo 1 MB).");
    }
    assertValidEdition(buffer, id);
  } else if (buffer.length > MAX_PDF_BYTES) {
    throw new HttpError(413, "O PDF é demasiado grande (máximo 5 MB).");
  }

  const github = createGitHubClient({
    token: requireEnv("GITHUB_TOKEN_PUBLISH", env),
    fetch: deps.fetch,
  });

  const branch = branchFor(id);
  const { created } = await github.ensureBranch(branch, BASE_BRANCH);

  // Replacing a file needs the sha it currently has on this branch — and a
  // freshly created branch already carries everything `main` had, so a
  // re-published edition finds its previous JSON and PDFs here too.
  const existing = await github.getFile(repoPath, branch);

  const { commitSha } = await github.putFile({
    path: repoPath,
    branch,
    contentBase64: buffer.toString("base64"),
    message: `${existing ? "Update" : "Add"} ${filename} for edition ${id}`,
    sha: existing?.sha ?? null,
  });

  return json(200, { ok: true, path: repoPath, commitSha, branch, created });
}

export const handler = handle((event) => run(event));

/** Parse and validate the uploaded edition; refuse it with the same messages. */
function assertValidEdition(buffer, id) {
  let parsed;
  try {
    parsed = JSON.parse(buffer.toString("utf8"));
  } catch (error) {
    throw new HttpError(400, `O ficheiro JSON não é válido — ${error.message}`);
  }

  if (parsed?.id !== id) {
    throw new HttpError(
      400,
      `O campo "id" do ficheiro é "${parsed?.id ?? "(em falta)"}" mas está a publicar a edição "${id}".`
    );
  }

  const { errors } = validateEdition(parsed);
  if (errors.length) {
    throw new HttpError(422, "A edição não passou na validação.", { errors });
  }
}
