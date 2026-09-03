/**
 * Edition registry for the Tourism & Hospitality Brief.
 *
 * Every `20*.json` file in this folder is one edition; `edition.schema.json`
 * is deliberately excluded by the glob pattern. Adding a new edition is a
 * matter of dropping a JSON file here — no code change (Componentes Visuais
 * v0.9 s.8: "atualização possível sem intervenção técnica recorrente").
 */

const modules = import.meta.glob("./20*.json", { eager: true });

/** Rank of a period inside its year. Higher = later; annual sorts last. */
function periodRank(edition) {
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
function byPeriodDesc(a, b) {
  const yearDiff = (b.period?.year ?? 0) - (a.period?.year ?? 0);
  if (yearDiff !== 0) return yearDiff;
  const rankDiff = periodRank(b) - periodRank(a);
  if (rankDiff !== 0) return rankDiff;
  return String(b.id).localeCompare(String(a.id));
}

const ALL = Object.values(modules)
  .map((m) => m?.default ?? m)
  .filter((e) => e && e.id)
  .sort(byPeriodDesc);

const BY_ID = new Map(ALL.map((e) => [e.id, e]));

/** All editions, newest first. */
export function getEditions() {
  return ALL.slice();
}

/** One edition by id, or undefined. */
export function getEdition(id) {
  return BY_ID.get(id);
}

/** Most recent edition across every horizon. */
export function getLatest() {
  return ALL[0];
}

/**
 * Chronological neighbours **within the same editorial horizon**, so a monthly
 * brief never links into a quarterly one.
 * @returns {{prev: object|undefined, next: object|undefined}} prev = older.
 */
export function getAdjacent(id) {
  const edition = BY_ID.get(id);
  if (!edition) return { prev: undefined, next: undefined };
  const sameHorizon = ALL.filter((e) => e.horizon === edition.horizon);
  const i = sameHorizon.findIndex((e) => e.id === id);
  return { prev: sameHorizon[i + 1], next: sameHorizon[i - 1] };
}

/**
 * Archive grouping.
 * @returns {{year: number, editions: object[]}[]} years newest first.
 */
export function groupByYear(editions = ALL) {
  const years = new Map();
  editions.slice().sort(byPeriodDesc).forEach((edition) => {
    const year = edition.period?.year ?? 0;
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(edition);
  });
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({ year, editions: list }));
}
