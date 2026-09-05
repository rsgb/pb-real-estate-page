# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Paulo-Braga-Real-Estate

## Market Brief editions

Each edition of the Tourism & Hospitality Brief is one JSON file in
`src/content/editions/`, validated against `edition.schema.json` by
`scripts/validate-editions.mjs` (run automatically before every build).

That JSON is the whole edition: the two PDFs are rendered from it during
`prebuild` by `scripts/render-pdfs.mjs` (Python plus `reportlab`, see
`requirements.txt`) and are never committed.

Paulo publishes an edition himself from the private `/publicar/` page: he signs
in with a passphrase, uploads the JSON, and it is committed to an
`edition/<id>` branch and offered as a pull request. Nothing reaches the live
site until that pull request is merged. The flow, the endpoints, the
environment variables and how to review an incoming pull request are in
[`docs/publishing.md`](docs/publishing.md).

Set the optional `historical: true` on an edition that is published after its
period has closed, as part of the backfill: the site then labels it "Edição
histórica" in the edition header, in the archive and on its Open Graph card, and
`historicalNote` (`{ pt, en }`) adds one free sentence under that notice. The
validator warns when an edition is published more than 120 days after the end of
its period without the flag.
