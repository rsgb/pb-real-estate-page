/**
 * POST /.netlify/functions/publish-finish   (session required)
 *
 * Body:    { id }
 * Returns: 200 { ok: true, prUrl, prNumber, previewUrl, reused }
 *
 * Last step: check that the branch really holds the three files and that the
 * JSON's `pdf.pt` / `pdf.en` are the PDFs that were uploaded, then open the
 * pull request Rui reviews. Calling it twice returns the same pull request
 * instead of opening a second one.
 */
import { validateEdition } from "../../src/lib/edition-validation.mjs";
import { requireSession } from "./_lib/auth.mjs";
import {
  BASE_BRANCH,
  branchFor,
  createGitHubClient,
  previewUrlFor,
} from "./_lib/github.mjs";
import { HttpError, handle, json, readJsonBody, requireEnv } from "./_lib/http.mjs";
import {
  assertEditionId,
  briefPdfPath,
  describePeriod,
  editionJsonPath,
} from "./_lib/publish.mjs";

export async function run(event, deps = {}) {
  const env = deps.env ?? process.env;
  const body = readJsonBody(event);
  requireSession(event, env);

  const id = assertEditionId(body.id);
  const branch = branchFor(id);

  const github = createGitHubClient({
    token: requireEnv("GITHUB_TOKEN_PUBLISH", env),
    fetch: deps.fetch,
  });

  if (!(await github.getRefSha(branch))) {
    throw new HttpError(409, `Ainda não há ficheiros enviados para a edição "${id}".`);
  }

  // 1. The JSON must be on the branch and still valid.
  const jsonFile = await github.getFile(editionJsonPath(id), branch);
  if (!jsonFile) {
    throw new HttpError(409, "O ficheiro JSON da edição ainda não foi enviado.");
  }

  let edition;
  try {
    edition = JSON.parse(jsonFile.content);
  } catch {
    throw new HttpError(409, "O ficheiro JSON gravado no ramo não é válido.");
  }

  const { errors, derived } = validateEdition(edition);
  if (errors.length) {
    throw new HttpError(422, "A edição no ramo não passou na validação.", { errors });
  }

  // 2. Both PDFs must be on the branch, under the exact names the JSON declares.
  const missing = [];
  for (const lang of ["pt", "en"]) {
    const name = derived.pdfNames[lang];
    if (!name) {
      missing.push(`pdf.${lang}`);
      continue;
    }
    if (!(await github.getFile(briefPdfPath(name), branch))) missing.push(name);
  }
  if (missing.length) {
    throw new HttpError(
      409,
      `Faltam ficheiros no ramo: ${missing.join(", ")}. Envie os PDFs antes de concluir.`
    );
  }

  // 3. One pull request per edition branch.
  const [existing] = await github.listPulls(branch, BASE_BRANCH);
  const pull =
    existing ??
    (await github.createPull({
      branch,
      baseBranch: BASE_BRANCH,
      title: derived.title ?? `Tourism & Hospitality Brief — ${id}`,
      body: pullRequestBody({ id, derived }),
    }));

  const prNumber = pull?.number;
  if (!prNumber) {
    throw new HttpError(502, "O GitHub não devolveu o número do pedido de publicação.");
  }

  return json(200, {
    ok: true,
    prUrl: pull.html_url,
    prNumber,
    previewUrl: previewUrlFor(prNumber, id),
    reused: Boolean(existing),
  });
}

export const handler = handle((event) => run(event));

/** Everything Rui needs in order to review without opening the files. */
function pullRequestBody({ id, derived }) {
  return [
    `Edição **${id}** enviada através de \`/publicar/\`.`,
    "",
    "| | |",
    "| --- | --- |",
    `| Título | ${derived.title ?? "—"} |`,
    `| Horizonte | ${derived.horizon ?? "—"} |`,
    `| Período | ${describePeriod(derived)} |`,
    `| Versão | ${derived.version ?? "—"} |`,
    `| Edição histórica | ${derived.historical ? "sim" : "não"} |`,
    "",
    "**Ficheiros**",
    "",
    `- \`${editionJsonPath(id)}\``,
    `- \`${briefPdfPath(derived.pdfNames.pt)}\``,
    `- \`${briefPdfPath(derived.pdfNames.en)}\``,
    "",
    "**Pré-visualização**",
    "",
    "A deploy preview desta PR serve a edição em",
    `\`/pt/market-brief/${id}/\` e \`/en/market-brief/${id}/\`.`,
    "",
    "A edição só fica pública quando esta PR for aprovada e integrada em `main`.",
  ].join("\n");
}
