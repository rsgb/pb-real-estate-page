/**
 * The edition registry's logic, with no build-tool dependency.
 *
 * `index.js` collects the JSON files through `import.meta.glob` (a Vite
 * transform) and hands the list to `createEditionRegistry` here. Keeping the
 * logic in a plain module means `npm test` can exercise it — in particular the
 * case-insensitive lookup that lets `/en/market-brief/2025-q4/` find the
 * edition whose id is `2025-Q4`.
 */
import { editionSlug } from "../../lib/format.js";

/** Rank of a period inside its year. Higher = later; annual sorts last. */
export function periodRank(edition) {
  const p = edition.period ?? {};
  switch (edition.horizon) {
    case "monthly":
      return p.month ?? 0;
    case "quarterly":
      return (p.quarter ?? 0) * 3;
    case "half-year":
      return (p.half ?? 0) * 6;
    case "annual":
      return 13;
    default:
      return 0;
  }
}

/** Newest first. Ties (e.g. December vs H2) fall back to the id. */
export function byPeriodDesc(a, b) {
  const yearDiff = (b.period?.year ?? 0) - (a.period?.year ?? 0);
  if (yearDiff !== 0) return yearDiff;
  const rankDiff = periodRank(b) - periodRank(a);
  if (rankDiff !== 0) return rankDiff;
  return String(b.id).localeCompare(String(a.id));
}

/**
 * Archive grouping.
 * @returns {{year: number, editions: object[]}[]} years newest first.
 */
export function groupEditionsByYear(editions) {
  const years = new Map();
  editions
    .slice()
    .sort(byPeriodDesc)
    .forEach((edition) => {
      const year = edition.period?.year ?? 0;
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(edition);
    });
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({ year, editions: list }));
}

/**
 * @param {object[]} editions the edition objects, in any order
 * @returns {{
 *   getEditions: () => object[],
 *   getEdition: (id: string) => object|undefined,
 *   getLatest: () => object|undefined,
 *   getAdjacent: (id: string) => {prev: object|undefined, next: object|undefined},
 *   groupByYear: (editions?: object[]) => {year: number, editions: object[]}[],
 * }}
 */
export function createEditionRegistry(editions) {
  const all = editions.filter((e) => e && e.id).sort(byPeriodDesc);
  const bySlug = new Map(all.map((e) => [editionSlug(e.id), e]));

  /** All editions, newest first. */
  const getEditions = () => all.slice();

  /**
   * One edition by id or by URL slug, or undefined. The comparison is
   * case-insensitive, so both `2025-Q4` (the id, and the links published before
   * the slug fix) and `2025-q4` (the path Netlify redirects to) resolve.
   */
  const getEdition = (id) => bySlug.get(editionSlug(id));

  /** Most recent edition across every horizon. */
  const getLatest = () => all[0];

  /**
   * Chronological neighbours **within the same editorial horizon**, so a
   * monthly brief never links into a quarterly one. `prev` is the older one.
   */
  const getAdjacent = (id) => {
    const edition = getEdition(id);
    if (!edition) return { prev: undefined, next: undefined };
    const sameHorizon = all.filter((e) => e.horizon === edition.horizon);
    const i = sameHorizon.indexOf(edition);
    return { prev: sameHorizon[i + 1], next: sameHorizon[i - 1] };
  };

  const groupByYear = (list = all) => groupEditionsByYear(list);

  return { getEditions, getEdition, getLatest, getAdjacent, groupByYear };
}
