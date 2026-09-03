/**
 * An in-memory stand-in for the slice of the GitHub REST API the publish flow
 * uses, plus the small event/response helpers the endpoint tests need.
 *
 * Nothing here talks to a network and nothing needs a token: `fetchImpl` is
 * passed to `createGitHubClient({ fetch })`, and every call it receives is
 * recorded so a test can assert *how* the endpoint got to its answer (a branch
 * created from `main`, a PUT carrying the sha of the file it replaces, a pull
 * request reused instead of opened twice).
 */
import { COOKIE_NAME, signSession } from "../../netlify/functions/_lib/auth.mjs";
import { handle } from "../../netlify/functions/_lib/http.mjs";

export const SESSION_SECRET = "test-session-secret-0123456789";
export const PASSPHRASE = "frase de acesso de teste";

/** The three variables every endpoint expects to find in the environment. */
export const ENV = {
  PUBLISH_PASSPHRASE: PASSPHRASE,
  PUBLISH_SESSION_SECRET: SESSION_SECRET,
  GITHUB_TOKEN_PUBLISH: "github_pat_fake_for_tests",
};

/** A `Cookie` header carrying a valid session. */
export function sessionHeader(secret = SESSION_SECRET) {
  return `${COOKIE_NAME}=${signSession(secret).token}`;
}

/** A well-formed POST event. */
export function postEvent(body, options = {}) {
  const headers = { "content-type": "application/json" };
  if (options.cookie !== null) headers.cookie = options.cookie ?? sessionHeader();
  return {
    httpMethod: options.method ?? "POST",
    headers: { ...headers, ...(options.headers ?? {}) },
    body: options.rawBody ?? JSON.stringify(body ?? {}),
    isBase64Encoded: false,
  };
}

/** Run an endpoint's `run` through the shared error wrapper and parse the body. */
export async function call(run, event, deps) {
  const response = await handle((e) => run(e, deps))(event);
  return { ...response, json: JSON.parse(response.body) };
}

const enc = (text) => Buffer.from(text, "utf8").toString("base64");

/**
 * @param {{refs?: Record<string,string>, files?: Record<string,string>,
 *          pulls?: object[]}} seed
 *   `refs`  branch -> commit sha, e.g. `{ main: "sha-main" }`
 *   `files` "<branch>:<path>" -> file content as text
 */
export function fakeGitHub(seed = {}) {
  const refs = new Map(Object.entries(seed.refs ?? { main: "sha-main" }));
  const files = new Map(
    Object.entries(seed.files ?? {}).map(([key, content]) => [
      key,
      { content, sha: `blob-${hash(key)}` },
    ])
  );
  const pulls = [...(seed.pulls ?? [])];
  const calls = [];
  /** branch -> the branch it was cut from, so reads inherit like a real fork. */
  const parents = new Map();
  let nextPull = seed.nextPullNumber ?? 12;
  let commit = 0;

  /** A file as the branch sees it: its own copy, else the one it inherited. */
  function resolve(branch, path) {
    let current = branch;
    const seen = new Set();
    while (current && !seen.has(current)) {
      seen.add(current);
      const file = files.get(`${current}:${path}`);
      if (file) return file;
      current = parents.get(current);
    }
    return undefined;
  }

  const reply = (status, body) => ({
    status,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  });

  async function fetchImpl(rawUrl, init = {}) {
    const url = new URL(rawUrl);
    const method = (init.method ?? "GET").toUpperCase();
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ method, path: url.pathname, search: url.search, body });

    const after = url.pathname.split("/repos/")[1] ?? "";
    const rest = after.split("/").slice(2).join("/"); // drop <owner>/<repo>

    // ------------------------------------------------------------- refs
    if (method === "GET" && rest.startsWith("git/ref/heads/")) {
      const branch = decodeURIComponent(rest.slice("git/ref/heads/".length));
      const sha = refs.get(branch);
      return sha ? reply(200, { object: { sha } }) : reply(404, { message: "Not Found" });
    }
    if (method === "POST" && rest === "git/refs") {
      const branch = String(body.ref).replace(/^refs\/heads\//, "");
      if (refs.has(branch)) return reply(422, { message: "Reference already exists" });
      const from = [...refs.entries()].find(([, sha]) => sha === body.sha)?.[0];
      if (from) parents.set(branch, from);
      refs.set(branch, body.sha);
      return reply(201, { ref: body.ref, object: { sha: body.sha } });
    }

    // --------------------------------------------------------- contents
    if (rest.startsWith("contents/")) {
      const path = decodeURIComponent(rest.slice("contents/".length));
      if (method === "GET") {
        const branch = url.searchParams.get("ref");
        const file = resolve(branch, path);
        if (!file) return reply(404, { message: "Not Found" });
        return reply(200, {
          type: "file",
          sha: file.sha,
          encoding: "base64",
          size: file.content.length,
          content: enc(file.content),
        });
      }
      if (method === "PUT") {
        const key = `${body.branch}:${path}`;
        const existing = resolve(body.branch, path);
        // GitHub refuses a blind overwrite; the endpoint must send the sha.
        if (existing && body.sha !== existing.sha) {
          return reply(409, { message: "sha does not match" });
        }
        const content = Buffer.from(body.content, "base64").toString("utf8");
        files.set(key, { content, sha: `blob-${hash(key)}-${++commit}` });
        return reply(existing ? 200 : 201, { commit: { sha: `commit-${commit}` } });
      }
    }

    // ------------------------------------------------------------ pulls
    if (method === "GET" && rest === "pulls") {
      const head = url.searchParams.get("head");
      return reply(
        200,
        pulls.filter((p) => `${p.ownerLogin ?? "rsgb"}:${p.head}` === head)
      );
    }
    if (method === "POST" && rest === "pulls") {
      const number = nextPull++;
      const pull = {
        number,
        head: body.head,
        base: body.base,
        title: body.title,
        body: body.body,
        html_url: `https://github.com/rsgb/pb-real-estate-page/pull/${number}`,
      };
      pulls.push(pull);
      return reply(201, pull);
    }

    return reply(404, { message: `unrouted ${method} ${url.pathname}` });
  }

  return {
    fetchImpl,
    calls,
    refs,
    files,
    pulls,
    /** Every call matching a method and a path fragment. */
    callsTo(method, fragment) {
      return calls.filter((c) => c.method === method && c.path.includes(fragment));
    },
    /** Text content of a file as a branch sees it (own copy or inherited). */
    read(branch, path) {
      return resolve(branch, path)?.content;
    },
    /** Text content of a branch's *own* copy, ignoring what it inherited. */
    readOwn(branch, path) {
      return files.get(`${branch}:${path}`)?.content;
    },
  };
}

/** Tiny deterministic hash, only so seeded files get stable shas. */
function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value.toString(16);
}
