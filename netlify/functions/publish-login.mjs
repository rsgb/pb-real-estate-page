/**
 * POST /.netlify/functions/publish-login
 *
 * Body:    { passphrase: string }
 * Success: 200 { ok: true } + the pb_publish session cookie
 * Failure: 401 { error } after a one-second pause, so guessing the passphrase
 *          costs a second per attempt.
 *
 * Every endpoint here exports `handler` and no default export: that is what
 * makes Netlify treat the file as a v1 (event/context) function. `run` takes
 * its environment as an argument so the tests can drive it without secrets.
 */
import {
  LOGIN_FAILURE_DELAY_MS,
  SESSION_TTL_MS,
  checkPassphrase,
  sessionCookie,
  signSession,
  sleep,
} from "./_lib/auth.mjs";
import { handle, json, readJsonBody, requireEnv } from "./_lib/http.mjs";

export async function run(event, deps = {}) {
  const env = deps.env ?? process.env;
  const body = readJsonBody(event);

  const passphrase = requireEnv("PUBLISH_PASSPHRASE", env);
  const secret = requireEnv("PUBLISH_SESSION_SECRET", env);

  if (!checkPassphrase(body.passphrase, passphrase)) {
    await sleep(deps.failureDelayMs ?? LOGIN_FAILURE_DELAY_MS);
    return json(401, { error: "Frase de acesso incorreta." });
  }

  const { token, exp } = signSession(secret);
  return json(
    200,
    { ok: true, expiresAt: new Date(exp).toISOString() },
    { cookies: [sessionCookie(token, SESSION_TTL_MS)] }
  );
}

export const handler = handle((event) => run(event));
