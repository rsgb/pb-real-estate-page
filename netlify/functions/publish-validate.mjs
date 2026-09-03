/**
 * POST /.netlify/functions/publish-validate   (session required)
 *
 * Body:    { edition: object }
 * Returns: 200 {
 *            errors: string[], warnings: string[], derived: {...},
 *            state: "new" | "pending" | "published",
 *            publishedVersion?: string, prUrl?: string
 *          }
 *
 * The same rules the build runs, plus the one question a local check cannot
 * answer: does this edition already exist on `main` (published) or on its own
 * branch (pending)? Re-publishing a live edition is only allowed with a higher
 * `version`, so a re-upload cannot silently overwrite what readers have.
 *
 * `run` takes its environment and its `fetch` as arguments so the tests can
 * exercise it without secrets or a network; `handler` is the Netlify entry.
 */
import { compareVersions, validateEdition } from "../../src/lib/edition-validation.mjs";
import { requireSession } from "./_lib/auth.mjs";
import { createGitHubClient, BASE_BRANCH, branchFor } from "./_lib/github.mjs";
import { handle, json, readJsonBody, requireEnv } from "./_lib/http.mjs";
import { editionJsonPath } from "./_lib/publish.mjs";

export async function run(event, deps = {}) {
  const env = deps.env ?? process.env;
  const body = readJsonBody(event);
  requireSession(event, env);

  const { errors, warnings, derived } = validateEdition(body.edition);

  // Without an id there is nothing to look up on GitHub; the schema errors
  // above already say why.
  if (!derived.id) {
    return json(200, { errors, warnings, derived, state: "new" });
  }

  const github = createGitHubClient({
    token: requireEnv("GITHUB_TOKEN_PUBLISH", env),
    fetch: deps.fetch,
  });
  const path = editionJsonPath(derived.id);
  const branch = branchFor(derived.id);

  const onMain = await github.getFile(path, BASE_BRANCH);

  let state = "new";
  let publishedVersion;
  let prUrl;

  if (onMain) {
    state = "published";
    publishedVersion = readVersion(onMain.content);
    if (publishedVersion && compareVersions(derived.version, publishedVersion) <= 0) {
      errors.push(
        `version: edição já publicada com a versão ${publishedVersion}; aumente \`version\``
      );
    }
  } else if (await github.getRefSha(branch)) {
    state = "pending";
    const [pull] = await github.listPulls(branch);
    if (pull) prUrl = pull.html_url;
  }

  return json(200, {
    errors,
    warnings,
    derived,
    state,
    ...(publishedVersion ? { publishedVersion } : {}),
    ...(prUrl ? { prUrl } : {}),
  });
}

export const handler = handle((event) => run(event));

/** `version` of an edition file already in the repo, or null. */
function readVersion(content) {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed?.version === "string" ? parsed.version : null;
  } catch {
    return null;
  }
}
