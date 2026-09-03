/**
 * Passphrase check and session cookie for the publish endpoints.
 *
 * There is one user, so there is no user store: knowing PUBLISH_PASSPHRASE is
 * the whole authentication. A successful login returns a cookie holding an
 * expiry and an HMAC-SHA256 of that expiry under PUBLISH_SESSION_SECRET, so
 * the session is verifiable without any server-side state.
 *
 * Neither secret is ever logged, returned or echoed.
 */
import crypto from "node:crypto";
import { HttpError, requireEnv } from "./http.mjs";

export const COOKIE_NAME = "pb_publish";

/** Sessions last one working session; Paulo re-enters the passphrase after that. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** Delay before answering a wrong passphrase, to make guessing expensive. */
export const LOGIN_FAILURE_DELAY_MS = 1000;

const hmac = (secret, message) =>
  crypto.createHmac("sha256", secret).update(message).digest("hex");

/**
 * Constant-time comparison of two strings of any length.
 * The SHA-256 digests are equal-length by construction, which is what
 * `timingSafeEqual` requires; hashing first is what makes that true.
 */
export function safeEqual(a, b) {
  const digestA = crypto.createHash("sha256").update(String(a ?? ""), "utf8").digest();
  const digestB = crypto.createHash("sha256").update(String(b ?? ""), "utf8").digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

/** True when `given` is the configured passphrase. */
export function checkPassphrase(given, expected) {
  if (typeof given !== "string" || given.length === 0) return false;
  return safeEqual(given, expected);
}

/**
 * Mint a session token.
 * @param {string} secret PUBLISH_SESSION_SECRET
 * @param {{now?: number, ttlMs?: number}} [options]
 * @returns {{token: string, exp: number}} `exp` is a UNIX timestamp in ms
 */
export function signSession(secret, options = {}) {
  const now = options.now ?? Date.now();
  const exp = now + (options.ttlMs ?? SESSION_TTL_MS);
  return { token: `${exp}.${hmac(secret, String(exp))}`, exp };
}

/**
 * Verify a session token.
 * @returns {{valid: boolean, reason?: "malformed"|"signature"|"expired", exp?: number}}
 */
export function verifySession(token, secret, options = {}) {
  const now = options.now ?? Date.now();
  if (typeof token !== "string") return { valid: false, reason: "malformed" };
  const match = /^(\d{10,16})\.([0-9a-f]{64})$/.exec(token);
  if (!match) return { valid: false, reason: "malformed" };

  const [, expToken, signature] = match;
  const expected = hmac(secret, expToken);
  // Both sides are 64 hex characters, so this comparison is length-safe.
  const ok = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
  if (!ok) return { valid: false, reason: "signature" };

  const exp = Number(expToken);
  if (exp <= now) return { valid: false, reason: "expired", exp };
  return { valid: true, exp };
}

/** `Set-Cookie` value for a fresh session. */
export function sessionCookie(token, ttlMs = SESSION_TTL_MS) {
  const maxAge = Math.floor(ttlMs / 1000);
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

/** `Set-Cookie` value that removes the session. */
export function clearedCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
  ].join("; ");
}

/** Parse a `Cookie` header into a plain object. */
export function parseCookies(header) {
  const jar = {};
  for (const part of String(header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const name = part.slice(0, index).trim();
    if (name) jar[name] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return jar;
}

/**
 * Throw unless the request carries a valid, unexpired session.
 * @param {object} event Netlify Functions v1 event
 * @param {NodeJS.ProcessEnv} [env]
 */
export function requireSession(event, env = process.env) {
  const secret = requireEnv("PUBLISH_SESSION_SECRET", env);
  const headers = event?.headers ?? {};
  const jar = parseCookies(headers.cookie ?? headers.Cookie ?? "");
  const result = verifySession(jar[COOKIE_NAME], secret);
  if (!result.valid) {
    throw new HttpError(401, "Sessão terminada ou inexistente. Volte a entrar.");
  }
  return result;
}

/** Pause before answering a failed login. */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
