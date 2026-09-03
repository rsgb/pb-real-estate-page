/**
 * POST /.netlify/functions/publish-logout
 *
 * Clears the pb_publish cookie. No session is required: signing out must work
 * even when the session has already expired.
 */
import { clearedCookie } from "./_lib/auth.mjs";
import { handle, json, readJsonBody } from "./_lib/http.mjs";

export async function run(event) {
  readJsonBody(event); // method, content-type and size guards
  return json(200, { ok: true }, { cookies: [clearedCookie()] });
}

export const handler = handle((event) => run(event));
