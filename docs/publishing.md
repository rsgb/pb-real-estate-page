# Publicar uma edição — how `/publicar/` works

Paulo publishes an edition of the Tourism & Hospitality Brief himself, from
`https://paulobraga-realestate.pt/publicar/`. Nothing he does reaches the live
site: the page ends in a pull request that Rui reviews and merges.

## The flow

1. **Entrar** — Paulo types the passphrase. The function compares SHA-256
   digests in constant time and, on success, sets a session cookie
   (`pb_publish`, HttpOnly, Secure, SameSite=Strict, 8 hours). A wrong
   passphrase is answered after a one-second pause.
2. **Ficheiros** — he picks the edition JSON and the two PDFs. The JSON is
   parsed and validated **in the browser**, by
   [`src/lib/edition-validation.mjs`](../src/lib/edition-validation.mjs) — the
   same module `npm run build` and the functions use, so the three can never
   disagree. He sees the series, horizon, period, `historical` flag and the two
   PDF names the edition declares, plus any errors (blocking) and warnings
   (not blocking). A PDF whose name does not match can be renamed on the way up.
   «Validar no servidor» then asks the one question the browser cannot answer:
   is this edition already live, or already staged on its branch?
3. **Envio** — four steps with a status line each: JSON, PDF PT, PDF EN, pull
   request. Each file is a separate request, so a failure only costs that step;
   «Tentar de novo» resumes from it, and re-uploading a file overwrites it on
   the branch rather than duplicating it.

The result is a branch `edition/<id>` holding
`src/content/editions/<id>.json` and the two PDFs in `public/briefs/`, and one
pull request into `main`.

## Endpoints

All are `POST`, `application/json`, same-origin, at
`/.netlify/functions/<name>`. Errors are `{ "error": "…" }` in Portuguese;
stack traces and GitHub's own messages stay in the function log.

| Endpoint | Body | Success |
| --- | --- | --- |
| `publish-login` | `{ passphrase }` | `{ ok: true, expiresAt }` + `Set-Cookie` |
| `publish-logout` | `{}` | `{ ok: true }` + cleared cookie |
| `publish-validate` | `{ edition }` | `{ errors, warnings, derived, state, publishedVersion?, prUrl? }` |
| `publish-upload` | `{ id, kind, filename, contentBase64 }` | `{ ok: true, path, commitSha, branch, created }` |
| `publish-finish` | `{ id }` | `{ ok: true, prUrl, prNumber, previewUrl, reused }` |

- `kind` is `"json"`, `"pdf-pt"` or `"pdf-en"`.
- `state` is `"new"`, `"pending"` (staged on `edition/<id>`) or `"published"`
  (already on `main`). A published edition is refused unless `version` is
  higher than the one that is live.
- Every endpoint except `publish-login` and `publish-logout` requires the
  session cookie. Every one of them checks the method, the content type and the
  body size (5.5 MB) before anything else.
- No repo path is built from raw input: `id` must match
  `^\d{4}(-(0[1-9]|1[0-2]|Q[1-4]|H[12]))?$` and a filename must be exactly
  `<id>.json` or match the PDF naming pattern, whose period and language tokens
  must agree with the upload.

### Size limits

A PDF may be at most 5 MB, but files travel base64-encoded inside a JSON body
and base64 inflates them by 4/3, so **the practical ceiling is about 4 MB per
PDF**: beyond that the request exceeds the 5.5 MB body cap (itself under
Netlify's own 6 MB limit). The page says so before the upload starts.

## Environment variables

Set in Netlify for the **Production** and **Deploy Previews** contexts, marked
secret. They are never logged, returned or echoed; locally none of them exist,
and every function answers `Configuração em falta: <NAME>` rather than failing
obscurely.

| Variable | What it is |
| --- | --- |
| `GITHUB_TOKEN_PUBLISH` | fine-grained GitHub token, **Contents** and **Pull requests** read/write on `rsgb/pb-real-estate-page`, and nothing else |
| `PUBLISH_PASSPHRASE` | the passphrase Paulo types |
| `PUBLISH_SESSION_SECRET` | random string (32+ bytes) used to sign the session cookie |

### Rotating the token

1. GitHub → *Settings → Developer settings → Personal access tokens →
   Fine-grained tokens*. Create a new token limited to
   `rsgb/pb-real-estate-page` with **Contents: Read and write** and
   **Pull requests: Read and write**. Give it the shortest expiry that is
   practical.
2. Netlify → *Site configuration → Environment variables* → edit
   `GITHUB_TOKEN_PUBLISH` for both Production and Deploy Previews. Values take
   effect on the next function invocation; no redeploy is needed.
3. Revoke the old token on GitHub.
4. Check it works by signing in on `/publicar/` and pressing «Validar no
   servidor» with any edition file — that call is the first one that uses the
   token, and it changes nothing.

Rotate `PUBLISH_PASSPHRASE` or `PUBLISH_SESSION_SECRET` the same way. Changing
the session secret invalidates every open session immediately.

## Testing on a deploy preview

The functions cannot run locally without the Netlify CLI, which this repo does
not install. Test on a deploy preview:

1. Push the branch and open a pull request — Netlify builds a deploy preview at
   `https://deploy-preview-<n>--friendly-concha-a33870.netlify.app/`.
2. The publish variables are set for the Deploy Previews context, so
   `/publicar/` works there exactly as in production.
3. An upload made from a preview still commits to `edition/<id>` in the real
   repository and still opens a real pull request. Delete the branch and close
   the pull request afterwards if it was only a rehearsal.

`npm test` covers the validator, the session signing and all five endpoints
against an in-memory GitHub with an injected `fetch`, so most regressions
surface without a deploy.

## When a pull request arrives

Paulo sends a link like
`https://github.com/rsgb/pb-real-estate-page/pull/<n>`. To review it:

1. Read the pull-request body: title, horizon, period, version, `historical`
   flag and the three file paths.
2. Open the deploy preview at
   `https://deploy-preview-<n>--friendly-concha-a33870.netlify.app/pt/market-brief/<id>/`
   and its `/en/` twin. The preview takes about two minutes to build. Check the
   header, the takeaway, the indicators and both PDF links.
3. The build runs `scripts/validate-editions.mjs`, so a schema, takeaway,
   bilingual or PDF-naming problem fails the preview build rather than reaching
   the page. A red build is a content problem, not a hosting one — read the log.
4. Merge into `main`. Netlify deploys production, and the edition is live.
5. Delete the `edition/<id>` branch. Re-publishing the same edition later needs
   a higher `version` and starts a fresh branch.

If the edition should not go live, close the pull request and delete the
branch; tell Paulo what to fix, and he can send the same id again.
