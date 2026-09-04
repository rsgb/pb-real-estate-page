/**
 * Edition registry for the Tourism & Hospitality Brief.
 *
 * Every `20*.json` file in this folder is one edition; `edition.schema.json`
 * is deliberately excluded by the glob pattern. Adding a new edition is a
 * matter of dropping a JSON file here — no code change (Componentes Visuais
 * v0.9 s.8: "atualização possível sem intervenção técnica recorrente").
 *
 * This module is only the Vite glue: it collects the JSON files and hands them
 * to `createEditionRegistry` in `registry.js`, which holds the logic and is
 * plain ESM so `npm test` can run it.
 *
 * Ids keep their uppercase period token ("2025-Q4"); URLs use the lower-cased
 * slug (`editionSlug`), and lookups are keyed by that slug, so a URL parameter
 * in either case resolves to the same edition.
 */

import { editionSlug } from "../../lib/format.js";
import { createEditionRegistry } from "./registry.js";

export { editionSlug };

const modules = import.meta.glob("./20*.json", { eager: true });

const registry = createEditionRegistry(Object.values(modules).map((m) => m?.default ?? m));

export const { getEditions, getEdition, getLatest, getAdjacent, groupByYear } = registry;
