/**
 * The slice of the GitHub REST API the publish flow needs.
 *
 * Deliberately small: read a branch head, create a branch, read a file, write
 * a file, list pull requests, open one. No SDK, no retries, no caching.
 *
 * `fetch` is injected so the tests can drive every branch of the flow without
 * a network or a token.
 */
import { HttpError } from "./http.mjs";

export const API = "https://api.github.com";
export const OWNER = "rsgb";
export const REPO = "pb-real-estate-page";
export const BASE_BRANCH = "main";
export const NETLIFY_SITE = "friendly-concha-a33870";

/** Commits are attributed to Paulo, who is the one publishing. */
export const AUTHOR = { name: "Paulo Braga", email: "paulo.braga@kwportugal.pt" };

/** Where an edition's files live in the repo. */
export const EDITIONS_PATH = "src/content/editions";
export const BRIEFS_PATH = "public/briefs";

/** Branch an edition is staged on. */
export const branchFor = (id) => `edition/${id}`;

/** Deploy-preview URL of the edition page for a pull request number. */
export const previewUrlFor = (prNumber, id) =>
  `https://deploy-preview-${prNumber}--${NETLIFY_SITE}.netlify.app/pt/market-brief/${id}/`;

/**
 * @param {{token: string, owner?: string, repo?: string, fetch?: typeof globalThis.fetch}} options
 */
export function createGitHubClient(options) {
  const {
    token,
    owner = OWNER,
    repo = REPO,
    fetch: fetchImpl = globalThis.fetch,
  } = options ?? {};

  if (!token) throw new HttpError(500, "Configuração em falta: GITHUB_TOKEN_PUBLISH não está definido no servidor.");
  if (typeof fetchImpl !== "function") {
    throw new HttpError(500, "Configuração em falta: este runtime não tem fetch.");
  }

  const base = `${API}/repos/${owner}/${repo}`;

  /**
   * One API call.
   * @returns {Promise<{status: number, body: any}>} the caller decides what a
   *   non-2xx status means; only unexpected ones become an HttpError.
   */
  async function call(method, url, body) {
    let response;
    try {
      response = await fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "pb-real-estate-publish",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      console.error("github: network error", error?.message ?? error);
      throw new HttpError(502, "Não foi possível contactar o GitHub. Tente de novo.");
    }

    const text = await response.text();
    let parsed = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    return { status: response.status, body: parsed };
  }

  /** Fail with a Portuguese message; the GitHub message stays in the log. */
  function unexpected(what, result) {
    console.error(`github: ${what} failed`, result.status, result.body?.message ?? "");
    if (result.status === 401 || result.status === 403) {
      throw new HttpError(502, "O GitHub recusou as credenciais de publicação. Avise o Rui.");
    }
    throw new HttpError(502, `O GitHub recusou o pedido (${what}). Tente de novo.`);
  }

  return {
    owner,
    repo,

    /** Commit sha a branch points at, or null when the branch does not exist. */
    async getRefSha(branch) {
      const result = await call("GET", `${base}/git/ref/heads/${encodeURIComponent(branch)}`);
      if (result.status === 404) return null;
      if (result.status !== 200) unexpected("ler o ramo", result);
      return result.body?.object?.sha ?? null;
    },

    /** Create `branch` at `sha`. */
    async createBranch(branch, sha) {
      const result = await call("POST", `${base}/git/refs`, {
        ref: `refs/heads/${branch}`,
        sha,
      });
      // 422 "Reference already exists" — someone else created it meanwhile.
      if (result.status === 201 || result.status === 422) return;
      unexpected("criar o ramo", result);
    },

    /**
     * Make sure `branch` exists, branching from `from` when it does not.
     * @returns {Promise<{created: boolean, sha: string}>}
     */
    async ensureBranch(branch, from = BASE_BRANCH) {
      const existing = await this.getRefSha(branch);
      if (existing) return { created: false, sha: existing };

      const baseSha = await this.getRefSha(from);
      if (!baseSha) {
        throw new HttpError(502, `O ramo base "${from}" não foi encontrado no repositório.`);
      }
      await this.createBranch(branch, baseSha);
      return { created: true, sha: baseSha };
    },

    /**
     * Read one file.
     * @returns {Promise<{sha: string, content: string, size: number}|null>}
     *   `content` is the decoded UTF-8 text; null when the file is absent.
     */
    async getFile(filePath, ref) {
      const url = `${base}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(ref)}`;
      const result = await call("GET", url);
      if (result.status === 404) return null;
      if (result.status !== 200) unexpected("ler o ficheiro", result);
      const node = result.body;
      if (!node || Array.isArray(node) || node.type !== "file") return null;
      const content =
        typeof node.content === "string"
          ? Buffer.from(node.content, node.encoding === "base64" ? "base64" : "utf8").toString("utf8")
          : "";
      return { sha: node.sha, content, size: node.size ?? content.length };
    },

    /**
     * Create or replace one file on a branch.
     * @param {{path: string, branch: string, contentBase64: string,
     *          message: string, sha?: string|null}} params
     * @returns {Promise<{commitSha: string, path: string}>}
     */
    async putFile({ path: filePath, branch, contentBase64, message, sha }) {
      const result = await call("PUT", `${base}/contents/${encodePath(filePath)}`, {
        message,
        content: contentBase64,
        branch,
        author: AUTHOR,
        committer: AUTHOR,
        ...(sha ? { sha } : {}),
      });
      if (result.status !== 200 && result.status !== 201) unexpected("gravar o ficheiro", result);
      return { commitSha: result.body?.commit?.sha ?? null, path: filePath };
    },

    /** Open pull requests whose head is `branch`. */
    async listPulls(branch, baseBranch = BASE_BRANCH) {
      const query = new URLSearchParams({
        head: `${owner}:${branch}`,
        base: baseBranch,
        state: "open",
      });
      const result = await call("GET", `${base}/pulls?${query}`);
      if (result.status !== 200) unexpected("listar os pedidos de publicação", result);
      return Array.isArray(result.body) ? result.body : [];
    },

    /** Open a pull request from `branch` into `baseBranch`. */
    async createPull({ branch, baseBranch = BASE_BRANCH, title, body }) {
      const result = await call("POST", `${base}/pulls`, {
        title,
        head: branch,
        base: baseBranch,
        body,
        maintainer_can_modify: true,
      });
      if (result.status !== 201) unexpected("abrir o pedido de publicação", result);
      return result.body;
    },
  };
}

/** Percent-encode a repo path segment by segment, keeping the slashes. */
function encodePath(filePath) {
  return String(filePath)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
