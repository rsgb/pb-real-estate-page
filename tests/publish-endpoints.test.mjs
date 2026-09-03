/**
 * The five publish endpoints, driven end to end against an in-memory GitHub
 * (tests/helpers/fake-github.mjs). No network, no token, no secrets.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { COOKIE_NAME } from "../netlify/functions/_lib/auth.mjs";
import { MAX_BODY_BYTES, MAX_PDF_BYTES, fitsInRequest } from "../netlify/functions/_lib/http.mjs";
import { run as login } from "../netlify/functions/publish-login.mjs";
import { run as logout } from "../netlify/functions/publish-logout.mjs";
import { run as validate } from "../netlify/functions/publish-validate.mjs";
import { run as upload } from "../netlify/functions/publish-upload.mjs";
import { run as finish } from "../netlify/functions/publish-finish.mjs";
import { ENV, PASSPHRASE, call, fakeGitHub, postEvent, sessionHeader } from "./helpers/fake-github.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JULY_TEXT = fs.readFileSync(
  path.join(ROOT, "src", "content", "editions", "2026-07.json"),
  "utf8"
);
const JULY = JSON.parse(JULY_TEXT);
const ID = JULY.id;
const BRANCH = `edition/${ID}`;
const JSON_PATH = `src/content/editions/${ID}.json`;
const PDF_PT_PATH = `public/briefs/${JULY.pdf.pt}`;
const PDF_EN_PATH = `public/briefs/${JULY.pdf.en}`;

const b64 = (text) => Buffer.from(text, "utf8").toString("base64");
/** A payload that is not a real PDF but is the right size and shape. */
const fakePdf = (bytes = 2048) => Buffer.alloc(bytes, 0x25).toString("base64");

/* ------------------------------------------------------------------ login */

test("login with the right passphrase sets the session cookie", async () => {
  const result = await call(login, postEvent({ passphrase: PASSPHRASE }, { cookie: null }), {
    env: ENV,
  });
  assert.equal(result.statusCode, 200);
  assert.equal(result.json.ok, true);
  const [cookie] = result.multiValueHeaders["Set-Cookie"];
  assert.ok(cookie.startsWith(`${COOKIE_NAME}=`));
  assert.ok(cookie.includes("HttpOnly") && cookie.includes("SameSite=Strict"));
});

test("login with a wrong passphrase answers 401 and sets no cookie", async () => {
  const result = await call(login, postEvent({ passphrase: "errada" }, { cookie: null }), {
    env: ENV,
    failureDelayMs: 0,
  });
  assert.equal(result.statusCode, 401);
  assert.equal(result.json.error, "Frase de acesso incorreta.");
  assert.equal(result.multiValueHeaders, undefined);
});

test("a missing environment variable is a 500 that names it and nothing else", async () => {
  const result = await call(login, postEvent({ passphrase: PASSPHRASE }, { cookie: null }), {
    env: { PUBLISH_SESSION_SECRET: "x" },
  });
  assert.equal(result.statusCode, 500);
  assert.equal(
    result.json.error,
    "Configuração em falta: PUBLISH_PASSPHRASE não está definido no servidor."
  );
});

test("logout clears the cookie without needing a session", async () => {
  const result = await call(logout, postEvent({}, { cookie: null }), { env: ENV });
  assert.equal(result.statusCode, 200);
  assert.ok(result.multiValueHeaders["Set-Cookie"][0].includes("Max-Age=0"));
});

/* --------------------------------------------------------- request guards */

test("only POST is accepted", async () => {
  const result = await call(validate, postEvent({ edition: JULY }, { method: "GET" }), { env: ENV });
  assert.equal(result.statusCode, 405);
  assert.match(result.json.error, /Método não permitido/);
});

test("a non-JSON content type is refused", async () => {
  const event = postEvent({ edition: JULY }, { headers: { "content-type": "text/plain" } });
  const result = await call(validate, event, { env: ENV });
  assert.equal(result.statusCode, 415);
});

test("a body over 5,5 MB is refused before it is parsed", async () => {
  const event = postEvent(null, { rawBody: "x".repeat(MAX_BODY_BYTES + 1) });
  const result = await call(upload, event, { env: ENV });
  assert.equal(result.statusCode, 413);
  assert.match(result.json.error, /demasiado grande/);
});

test("a body that is not JSON is refused", async () => {
  const result = await call(validate, postEvent(null, { rawBody: "{nope" }), { env: ENV });
  assert.equal(result.statusCode, 400);
  assert.equal(result.json.error, "O corpo do pedido não é JSON válido.");
});

/* -------------------------------------------------------- session guards */

test("every protected endpoint refuses a request with no session", async () => {
  const cases = [
    [validate, { edition: JULY }],
    [upload, { id: ID, kind: "json", filename: `${ID}.json`, contentBase64: b64(JULY_TEXT) }],
    [finish, { id: ID }],
  ];
  for (const [run, body] of cases) {
    const result = await call(run, postEvent(body, { cookie: null }), { env: ENV });
    assert.equal(result.statusCode, 401);
    assert.equal(result.json.error, "Sessão terminada ou inexistente. Volte a entrar.");
  }
});

test("a session signed with another secret is refused", async () => {
  const event = postEvent({ edition: JULY }, { cookie: sessionHeader("wrong-secret") });
  const result = await call(validate, event, { env: ENV });
  assert.equal(result.statusCode, 401);
});

/* ------------------------------------------------------------- validate */

test("validate reports a brand-new edition", async () => {
  const github = fakeGitHub();
  const result = await call(validate, postEvent({ edition: JULY }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.statusCode, 200);
  assert.equal(result.json.state, "new");
  assert.deepEqual(result.json.errors, []);
  assert.equal(result.json.derived.id, ID);
});

test("validate reports an edition that is already staged on its branch", async () => {
  const github = fakeGitHub({
    refs: { main: "sha-main", [BRANCH]: "sha-branch" },
    pulls: [{ number: 9, head: BRANCH, html_url: "https://github.com/x/y/pull/9" }],
  });
  const result = await call(validate, postEvent({ edition: JULY }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.json.state, "pending");
  assert.equal(result.json.prUrl, "https://github.com/x/y/pull/9");
});

test("republishing a live edition at the same version is refused", async () => {
  const github = fakeGitHub({ files: { [`main:${JSON_PATH}`]: JULY_TEXT } });
  const result = await call(validate, postEvent({ edition: JULY }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.json.state, "published");
  assert.equal(result.json.publishedVersion, "1.0");
  assert.ok(
    result.json.errors.includes(
      "version: edição já publicada com a versão 1.0; aumente `version`"
    ),
    result.json.errors.join("\n")
  );
});

test("republishing a live edition with a higher version is allowed", async () => {
  const github = fakeGitHub({ files: { [`main:${JSON_PATH}`]: JULY_TEXT } });
  const edition = { ...JULY, version: "1.1" };
  const result = await call(validate, postEvent({ edition }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.json.state, "published");
  assert.deepEqual(result.json.errors, []);
});

test("validate passes the shared rules through unchanged", async () => {
  const github = fakeGitHub();
  const edition = structuredClone(JULY);
  edition.sections[2].indicators[0].change.unit = "ppt";
  const result = await call(validate, postEvent({ edition }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.ok(
    result.json.errors.includes(
      'sections[2].indicators[0].change.unit: valor "ppt" inválido; use "percent", "pp" ou "abs"'
    ),
    result.json.errors.join("\n")
  );
});

/* --------------------------------------------------------------- upload */

test("the first upload branches edition/<id> off main and commits the JSON", async () => {
  const github = fakeGitHub();
  const result = await call(
    upload,
    postEvent({ id: ID, kind: "json", filename: `${ID}.json`, contentBase64: b64(JULY_TEXT) }),
    { env: ENV, fetch: github.fetchImpl }
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.json.path, JSON_PATH);
  assert.equal(result.json.branch, BRANCH);
  assert.equal(result.json.created, true);

  const [created] = github.callsTo("POST", "/git/refs");
  assert.ok(created, "the branch was never created");
  assert.deepEqual(created.body, { ref: `refs/heads/${BRANCH}`, sha: "sha-main" });

  const [put] = github.callsTo("PUT", "/contents/");
  assert.equal(put.body.branch, BRANCH);
  assert.equal(put.body.sha, undefined, "a new file must be written without a sha");
  assert.deepEqual(put.body.author, {
    name: "Paulo Braga",
    email: "paulo.braga@kwportugal.pt",
  });
  assert.equal(github.read(BRANCH, JSON_PATH), JULY_TEXT);
});

test("re-uploading the same file replaces it using the sha it already has", async () => {
  const github = fakeGitHub({
    refs: { main: "sha-main", [BRANCH]: "sha-branch" },
    files: { [`${BRANCH}:${JSON_PATH}`]: "{}" },
  });
  const updated = JSON.stringify({ ...JULY, version: "1.1" }, null, 2);
  const result = await call(
    upload,
    postEvent({ id: ID, kind: "json", filename: `${ID}.json`, contentBase64: b64(updated) }),
    { env: ENV, fetch: github.fetchImpl }
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.json.created, false);
  assert.equal(github.callsTo("POST", "/git/refs").length, 0, "the branch already existed");

  const [put] = github.callsTo("PUT", "/contents/");
  assert.ok(put.body.sha, "an update must carry the current sha");
  assert.equal(github.read(BRANCH, JSON_PATH), updated);
});

test("a PDF is written to public/briefs under its own name", async () => {
  const github = fakeGitHub();
  const result = await call(
    upload,
    postEvent({ id: ID, kind: "pdf-pt", filename: JULY.pdf.pt, contentBase64: fakePdf() }),
    { env: ENV, fetch: github.fetchImpl }
  );
  assert.equal(result.statusCode, 200);
  assert.equal(result.json.path, PDF_PT_PATH);
});

test("a filename that does not belong to the edition is refused", async () => {
  const github = fakeGitHub();
  const cases = [
    ["json", "outra.json", /tem de se chamar/],
    ["json", "../../etc/passwd", /não pode conter caminhos/],
    ["pdf-pt", "THB_Monthly_2026-06_PT_PDF_v1.0.pdf", /não corresponde à edição/],
    ["pdf-pt", JULY.pdf.en, /não corresponde ao PDF em português/],
    ["pdf-en", "brief.pdf", /não segue o padrão/],
  ];
  for (const [kind, filename, expected] of cases) {
    const result = await call(
      upload,
      postEvent({ id: ID, kind, filename, contentBase64: fakePdf(16) }),
      { env: ENV, fetch: github.fetchImpl }
    );
    assert.equal(result.statusCode, 400, `${kind} ${filename}`);
    assert.match(result.json.error, expected);
  }
  assert.equal(github.callsTo("PUT", "/contents/").length, 0, "nothing may be written");
});

test("an invalid id is refused before anything is created", async () => {
  const github = fakeGitHub();
  const result = await call(
    upload,
    postEvent({ id: "2026-13", kind: "json", filename: "2026-13.json", contentBase64: b64("{}") }),
    { env: ENV, fetch: github.fetchImpl }
  );
  assert.equal(result.statusCode, 400);
  assert.match(result.json.error, /Identificador de edição inválido/);
  assert.equal(github.calls.length, 0);
});

test("an oversized PDF is refused and never reaches GitHub", async () => {
  const github = fakeGitHub();
  const result = await call(
    upload,
    postEvent({
      id: ID,
      kind: "pdf-pt",
      filename: JULY.pdf.pt,
      contentBase64: Buffer.alloc(MAX_PDF_BYTES + 1).toString("base64"),
    }),
    { env: ENV, fetch: github.fetchImpl }
  );
  assert.equal(result.statusCode, 413);
  assert.equal(github.callsTo("PUT", "/contents/").length, 0);
});

test("base64 makes the request cap, not MAX_PDF_BYTES, the effective ceiling", () => {
  // 4/3 inflation: a 5 MB PDF becomes ~6,7 MB of JSON, over the 5,5 MB cap.
  // The page uses the same arithmetic to warn Paulo before he uploads.
  assert.equal(fitsInRequest(MAX_PDF_BYTES), false);
  assert.equal(fitsInRequest(4 * 1024 * 1024), true);
  assert.equal(fitsInRequest(4.2 * 1024 * 1024), false);
  assert.ok(MAX_BODY_BYTES < 6 * 1024 * 1024, "must stay under Netlify's own 6 MB limit");
});

test("an edition that fails validation is never committed", async () => {
  const github = fakeGitHub();
  const edition = structuredClone(JULY);
  delete edition.dataStatus;
  const result = await call(
    upload,
    postEvent({
      id: ID,
      kind: "json",
      filename: `${ID}.json`,
      contentBase64: b64(JSON.stringify(edition)),
    }),
    { env: ENV, fetch: github.fetchImpl }
  );
  assert.equal(result.statusCode, 422);
  assert.equal(result.json.error, "A edição não passou na validação.");
  assert.ok(result.json.errors.includes('$: falta a propriedade obrigatória "dataStatus"'));
  assert.equal(github.callsTo("PUT", "/contents/").length, 0);
});

test("a JSON whose id contradicts the upload is refused", async () => {
  const github = fakeGitHub();
  const result = await call(
    upload,
    postEvent({
      id: ID,
      kind: "json",
      filename: `${ID}.json`,
      contentBase64: b64(JSON.stringify({ ...JULY, id: "2026-06" })),
    }),
    { env: ENV, fetch: github.fetchImpl }
  );
  assert.equal(result.statusCode, 400);
  assert.match(result.json.error, /"2026-06".*"2026-07"/);
});

/* --------------------------------------------------------------- finish */

function branchWithEverything(extra = {}) {
  return fakeGitHub({
    refs: { main: "sha-main", [BRANCH]: "sha-branch" },
    files: {
      [`${BRANCH}:${JSON_PATH}`]: JULY_TEXT,
      [`${BRANCH}:${PDF_PT_PATH}`]: "%PDF-pt",
      [`${BRANCH}:${PDF_EN_PATH}`]: "%PDF-en",
    },
    ...extra,
  });
}

test("finish opens one pull request and returns its preview URL", async () => {
  const github = branchWithEverything({ nextPullNumber: 42 });
  const result = await call(finish, postEvent({ id: ID }), {
    env: ENV,
    fetch: github.fetchImpl,
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.json.prNumber, 42);
  assert.equal(result.json.reused, false);
  assert.equal(
    result.json.previewUrl,
    `https://deploy-preview-42--friendly-concha-a33870.netlify.app/pt/market-brief/${ID}/`
  );

  const [created] = github.callsTo("POST", "/pulls");
  assert.equal(created.body.title, JULY.title.pt);
  assert.equal(created.body.head, BRANCH);
  assert.equal(created.body.base, "main");
  for (const fragment of [JSON_PATH, PDF_PT_PATH, PDF_EN_PATH, "monthly", "07/2026"]) {
    assert.ok(created.body.body.includes(fragment), `PR body is missing ${fragment}`);
  }
});

test("finish reuses the pull request when one is already open", async () => {
  const github = branchWithEverything({
    pulls: [{ number: 7, head: BRANCH, html_url: "https://github.com/x/y/pull/7" }],
  });
  const result = await call(finish, postEvent({ id: ID }), {
    env: ENV,
    fetch: github.fetchImpl,
  });

  assert.equal(result.json.prNumber, 7);
  assert.equal(result.json.reused, true);
  assert.equal(result.json.prUrl, "https://github.com/x/y/pull/7");
  assert.equal(github.callsTo("POST", "/pulls").length, 0, "a second PR must not be opened");
});

test("finish refuses to open a pull request when a PDF is missing", async () => {
  const github = fakeGitHub({
    refs: { main: "sha-main", [BRANCH]: "sha-branch" },
    files: {
      [`${BRANCH}:${JSON_PATH}`]: JULY_TEXT,
      [`${BRANCH}:${PDF_PT_PATH}`]: "%PDF-pt",
    },
  });
  const result = await call(finish, postEvent({ id: ID }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.statusCode, 409);
  assert.match(result.json.error, /Faltam ficheiros no ramo/);
  assert.ok(result.json.error.includes(JULY.pdf.en));
  assert.equal(github.callsTo("POST", "/pulls").length, 0);
});

test("finish refuses when nothing has been uploaded yet", async () => {
  const github = fakeGitHub();
  const result = await call(finish, postEvent({ id: ID }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.statusCode, 409);
  assert.match(result.json.error, /Ainda não há ficheiros enviados/);
});

test("finish re-validates the JSON that is actually on the branch", async () => {
  const broken = structuredClone(JULY);
  broken.takeaway.pt = Array.from({ length: 50 }, (_, i) => `p${i}`).join(" ");
  const github = fakeGitHub({
    refs: { main: "sha-main", [BRANCH]: "sha-branch" },
    files: {
      [`${BRANCH}:${JSON_PATH}`]: JSON.stringify(broken),
      [`${BRANCH}:${PDF_PT_PATH}`]: "%PDF-pt",
      [`${BRANCH}:${PDF_EN_PATH}`]: "%PDF-en",
    },
  });
  const result = await call(finish, postEvent({ id: ID }), {
    env: ENV,
    fetch: github.fetchImpl,
  });
  assert.equal(result.statusCode, 422);
  assert.ok(result.json.errors.includes("takeaway.pt: tem 50 palavras (máximo 45)"));
});

/* ---------------------------------------------------------- the full flow */

test("three uploads and a finish leave one branch, three files and one PR", async () => {
  const github = fakeGitHub();
  const deps = { env: ENV, fetch: github.fetchImpl };

  const steps = [
    { kind: "json", filename: `${ID}.json`, contentBase64: b64(JULY_TEXT) },
    { kind: "pdf-pt", filename: JULY.pdf.pt, contentBase64: fakePdf() },
    { kind: "pdf-en", filename: JULY.pdf.en, contentBase64: fakePdf() },
  ];
  for (const step of steps) {
    const result = await call(upload, postEvent({ id: ID, ...step }), deps);
    assert.equal(result.statusCode, 200, JSON.stringify(result.json));
  }

  const done = await call(finish, postEvent({ id: ID }), deps);
  assert.equal(done.statusCode, 200);
  assert.equal(done.json.ok, true);

  assert.equal(github.callsTo("POST", "/git/refs").length, 1, "the branch is created once");
  assert.equal(github.pulls.length, 1);
  for (const filePath of [JSON_PATH, PDF_PT_PATH, PDF_EN_PATH]) {
    assert.ok(github.read(BRANCH, filePath), `${filePath} is not on the branch`);
  }
  // Nothing was written to main.
  assert.equal(github.read("main", JSON_PATH), undefined);
});
