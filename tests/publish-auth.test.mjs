/**
 * Session signing and the passphrase check: `netlify/functions/_lib/auth.mjs`.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  COOKIE_NAME,
  SESSION_TTL_MS,
  checkPassphrase,
  clearedCookie,
  parseCookies,
  sessionCookie,
  signSession,
  verifySession,
} from "../netlify/functions/_lib/auth.mjs";

const SECRET = "a-secret-that-only-netlify-knows";

test("a freshly signed session verifies", () => {
  const { token, exp } = signSession(SECRET);
  const result = verifySession(token, SECRET);
  assert.equal(result.valid, true);
  assert.equal(result.exp, exp);
});

test("the default session lasts eight hours", () => {
  const now = 1_700_000_000_000;
  const { exp } = signSession(SECRET, { now });
  assert.equal(exp - now, SESSION_TTL_MS);
  assert.equal(SESSION_TTL_MS, 8 * 60 * 60 * 1000);
});

test("a session signed with another secret is rejected", () => {
  const { token } = signSession("some-other-secret");
  assert.deepEqual(verifySession(token, SECRET), { valid: false, reason: "signature" });
});

test("a tampered expiry is rejected — the signature covers it", () => {
  const { token } = signSession(SECRET, { now: 1_700_000_000_000 });
  const [, signature] = token.split(".");
  const forged = `${Date.now() + 10 * 60 * 60 * 1000}.${signature}`;
  assert.deepEqual(verifySession(forged, SECRET), { valid: false, reason: "signature" });
});

test("an expired session is rejected", () => {
  const now = 1_700_000_000_000;
  const { token } = signSession(SECRET, { now, ttlMs: 1000 });
  assert.equal(verifySession(token, SECRET, { now: now + 500 }).valid, true);
  const expired = verifySession(token, SECRET, { now: now + 1500 });
  assert.equal(expired.valid, false);
  assert.equal(expired.reason, "expired");
});

test("garbage is rejected as malformed, not as an exception", () => {
  for (const token of [undefined, null, "", "abc", "123.456", `${Date.now()}.zz`]) {
    assert.equal(verifySession(token, SECRET).reason, "malformed");
  }
});

test("the cookie is HttpOnly, Secure, SameSite=Strict and site-wide", () => {
  const cookie = sessionCookie("t.0");
  assert.ok(cookie.startsWith(`${COOKIE_NAME}=t.0;`));
  for (const attribute of ["Path=/", "HttpOnly", "Secure", "SameSite=Strict"]) {
    assert.ok(cookie.includes(attribute), `${attribute} missing from ${cookie}`);
  }
  assert.ok(cookie.includes(`Max-Age=${SESSION_TTL_MS / 1000}`));
});

test("logging out sends an immediately expiring cookie", () => {
  assert.ok(clearedCookie().includes("Max-Age=0"));
  assert.ok(clearedCookie().startsWith(`${COOKIE_NAME}=;`));
});

test("the passphrase check accepts only the exact passphrase", () => {
  const real = "abre-te, Sésamo";
  assert.equal(checkPassphrase(real, real), true);
  assert.equal(checkPassphrase("abre-te, sésamo", real), false);
  assert.equal(checkPassphrase(`${real} `, real), false);
  assert.equal(checkPassphrase("", real), false);
  assert.equal(checkPassphrase(undefined, real), false);
  // Different lengths must not throw: the digests are compared, not the input.
  assert.equal(checkPassphrase("x", real), false);
});

test("cookies are parsed out of a header that carries several", () => {
  const jar = parseCookies(`other=1; ${COOKIE_NAME}=abc.def; last=2`);
  assert.equal(jar[COOKIE_NAME], "abc.def");
  assert.equal(jar.other, "1");
  assert.deepEqual(parseCookies(undefined), {});
});
