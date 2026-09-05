# Publicar uma edição — how `/publicar/` works

Paulo publishes an edition of the Tourism & Hospitality Brief himself, from
`https://paulobraga-realestate.pt/publicar/`. Nothing he does reaches the live
site: the page ends in a pull request that Rui reviews and merges.

## The flow

1. **Entrar** — Paulo types the passphrase. The function compares SHA-256
   digests in constant time and, on success, sets a session cookie
   (`pb_publish`, HttpOnly, Secure, SameSite=Strict, 8 hours). A wrong
   passphrase is answered after a one-second pause.
2. **Ficheiros** — he picks the edition JSON. That is the only file he sends:
   the two PDFs are rendered from it by the build (see [The PDFs are
   generated](#the-pdfs-are-generated)). The JSON is parsed and validated **in
   the browser**, by
   [`src/lib/edition-validation.mjs`](../src/lib/edition-validation.mjs) — the
   same module `npm run build` and the functions use, so the three can never
   disagree. He sees the series, horizon, period, `historical` flag and the two
   PDF names the edition declares (labelled as generated on publication), plus
   any errors (blocking) and warnings (not blocking). «Validar no servidor»
   then asks the one question the browser cannot answer: is this edition
   already live, or already staged on its branch?
3. **Envio** — two steps with a status line each: JSON, pull request.
   «Tentar de novo» resumes from the step that failed, and re-uploading the
   JSON overwrites it on the branch rather than duplicating it.

The result is a branch `edition/<id>` holding exactly one file,
`src/content/editions/<id>.json`, and one pull request into `main`.

## The PDFs are generated

Decision D-34: the edition PDF is a pure rendering of the reviewed JSON, so it
is produced by the build and **never committed**. Nobody uploads a PDF —
neither Paulo through `/publicar/` nor Rui through git.

- [`scripts/pdf/render-pdf.py`](../scripts/pdf/render-pdf.py) renders one
  edition, one language, into the filename the JSON's `pdf.pt` / `pdf.en`
  declares. It is the same renderer that produced the 58 PDFs Paulo reviewed
  on pull requests #8 and #9; it needs Python 3.8+, `reportlab` and nothing
  else (Helvetica core fonts, so no font file ships).
- [`scripts/render-pdfs.mjs`](../scripts/render-pdfs.mjs) drives it over every
  `src/content/editions/20*.json`, into `public/briefs/`, before Vite copies
  `public/` into `dist/`. A renderer failure fails the build, with the
  renderer's own stderr.
- `public/briefs/THB_*_PDF_*.pdf` is in `.gitignore`. Everything else in that
  folder — the LinkedIn signature image — stays in git.

`prebuild` therefore runs, in order:

```
node scripts/validate-editions.mjs --skip-pdf-presence
node scripts/render-pdfs.mjs
node scripts/validate-editions.mjs
node scripts/generate-og-images.mjs
```

The first validation catches a content problem before eleven seconds of
rendering are spent on it; the second one, with the presence check on, proves
the renderer really wrote every filename the editions declare. Each pass costs
about 0,2 s.

### Rendering locally

```
npm run render:pdfs            # uses python3 from PATH
npm run render:pdfs -- --force # re-render everything
PDF_PYTHON=/path/to/python npm run render:pdfs
```

A language is skipped when its PDF is already newer than both the edition JSON
and the renderer, so a second run costs no time. `--force`, and any build where
`NETLIFY` or `CI` is set, ignores that: a checkout gives every file the same
mtime, and on CI the only acceptable PDF is one just rendered.

Rendering all 58 takes about 10 s, so a clean `npm run build` is about 16 s
instead of about 5 s. If Python is missing the script says so and names
`PDF_PYTHON`; if `reportlab` is missing the renderer's ImportError is printed
in full.

### Python on Netlify

Two files at the repo root, both read by Netlify's build image from the base
directory before the build command runs:

| File | What it does |
| --- | --- |
| `requirements.txt` | `reportlab>=4.0,<6`; the image runs `pip install -r requirements.txt` because this file exists |

No Python version is pinned: the renderer runs on any Python from 3.8 up (checked on 3.9 and 3.14), and pinning a version the image does not ship would make Netlify download an interpreter on every build (the Noble image's default is 3.13). It has nothing to do with the Netlify Functions, which are Node.

**If a build fails on Python**, read the build log from the top; the Python
setup happens before `npm install`.

- *No `python3` on PATH* — `render-pdfs` says so by name. The build image
  always ships one; if it is ever missing, set `PYTHON_VERSION` in Netlify or
  add a `runtime.txt` with the image's own default.
- *`ModuleNotFoundError: reportlab`* — pip did not run, or ran for a different
  interpreter. Confirm `requirements.txt` is at the repo root and that the log
  shows an "Installing pip dependencies" step.
- *An interpreter version the image has to download* — someone added a
  `runtime.txt` or `PYTHON_VERSION`; remove it. The renderer is written to run
  on 3.8, and is checked on 3.9 and 3.14.
- *Nothing works and an edition must go out today* — render locally with
  `npm run render:pdfs`, commit the two PDFs with
  `git add -f public/briefs/<name>`, and open an issue. That is a deliberate
  exception to the rule above, not a fallback to go quiet about: the committed
  file goes stale the moment the JSON changes, which is exactly the drift D-34
  removed (the January 2025 PDFs on `main` were four days out of date with
  their own JSON when they were deleted).
- The documented port if the build image ever stops carrying Python: rewrite
  the renderer in Node with `pdfkit`, two to three days.

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

- `kind` is `"json"`, and only `"json"`. The `pdf-pt` and `pdf-en` kinds were
  removed with D-34: `.gitignore` cannot stop the GitHub API, so a PDF
  committed to a branch would reach the build with the same mtime as the JSON
  and could be served instead of the rendered one.
- `state` is `"new"`, `"pending"` (staged on `edition/<id>`) or `"published"`
  (already on `main`). A published edition is refused unless `version` is
  higher than the one that is live.
- Every endpoint except `publish-login` and `publish-logout` requires the
  session cookie. Every one of them checks the method, the content type and the
  body size (5.5 MB) before anything else.
- No repo path is built from raw input: `id` must match
  `^\d{4}(-(0[1-9]|1[0-2]|Q[1-4]|H[12]))?$` and the filename must be exactly
  `<id>.json`.

### Size limits

The edition JSON may be at most 1 MB, well inside the 5.5 MB body cap (itself
under Netlify's own 6 MB limit). Now that the PDFs are generated rather than
uploaded, nothing that travels through these endpoints comes near either
number.

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
   flag, the one file path on the branch and the two PDF names the build will
   generate.
2. Open the deploy preview at
   `https://deploy-preview-<n>--friendly-concha-a33870.netlify.app/pt/market-brief/<id>/`
   and its `/en/` twin. The preview takes about two minutes to build. Check the
   header, the takeaway, the indicators and both PDF links — the PDFs the
   preview serves are the ones production will serve, rendered from the same
   JSON, so opening them here is the whole review of the PDF.
3. The build runs `scripts/validate-editions.mjs` twice and
   `scripts/render-pdfs.mjs` between them, so a schema, takeaway, bilingual or
   PDF-naming problem, and any rendering failure, fails the preview build
   rather than reaching the page. A red build is a content problem, not a
   hosting one — read the log.
4. Merge into `main`. Netlify deploys production, and the edition is live.
5. Delete the `edition/<id>` branch. Re-publishing the same edition later needs
   a higher `version` and starts a fresh branch.

If the edition should not go live, close the pull request and delete the
branch; tell Paulo what to fix, and he can send the same id again.
