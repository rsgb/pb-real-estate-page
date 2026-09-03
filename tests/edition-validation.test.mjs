/**
 * Shared validator: `src/lib/edition-validation.mjs`.
 *
 * The reference input is the real July 2026 edition, so a change to the schema
 * or to the content immediately shows up here. Every broken case is a deep
 * clone of it with exactly one thing wrong, which keeps each assertion about
 * one rule.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareVersions,
  expectedPdfName,
  horizonFromId,
  jsonPath,
  publicationLagDays,
  validateEdition,
} from "../src/lib/edition-validation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JULY = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "content", "editions", "2026-07.json"), "utf8")
);
const PDFS_PRESENT = [JULY.pdf.pt, JULY.pdf.en];

/** Deep clone of the July edition, mutated by `mutate`. */
function broken(mutate) {
  const copy = structuredClone(JULY);
  mutate(copy);
  return copy;
}

/** The errors raised on one JSON path; fails when there are none. */
function errorsOn(result, prefix) {
  const found = result.errors.filter((message) => message.startsWith(`${prefix}:`));
  assert.ok(
    found.length > 0,
    `expected an error on "${prefix}", got:\n${result.errors.join("\n") || "(none)"}`
  );
  return found;
}

/* -------------------------------------------------------------- the good one */

test("the July 2026 edition validates with no errors and no warnings", () => {
  const result = validateEdition(JULY, { pdfNamesPresent: PDFS_PRESENT });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test("derived carries the id, the PDF names and the Portuguese title", () => {
  const { derived } = validateEdition(JULY);
  assert.equal(derived.id, "2026-07");
  assert.deepEqual(derived.pdfNames, { pt: JULY.pdf.pt, en: JULY.pdf.en });
  assert.equal(derived.title, JULY.title.pt);
  assert.equal(derived.horizon, "monthly");
  assert.equal(derived.historical, false);
  assert.equal(derived.version, "1.0");
});

test("a non-object input is rejected without throwing", () => {
  for (const input of [null, undefined, 42, "{}", []]) {
    const result = validateEdition(input);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /não é um objeto JSON de edição/);
    assert.equal(result.derived.id, null);
  }
});

/* ------------------------------------------------------------------- schema */

test("an invalid enum names the full JSON path and the accepted values", () => {
  const result = validateEdition(
    broken((e) => {
      e.sections[2].indicators[0].change.unit = "ppt";
    })
  );
  assert.ok(
    result.errors.includes(
      'sections[2].indicators[0].change.unit: valor "ppt" inválido; use "percent", "pp" ou "abs"'
    ),
    result.errors.join("\n")
  );
});

test("a missing required property is reported on its parent", () => {
  const result = validateEdition(
    broken((e) => {
      delete e.dataStatus;
    })
  );
  assert.ok(
    result.errors.includes('$: falta a propriedade obrigatória "dataStatus"'),
    result.errors.join("\n")
  );
});

test("an unknown property is reported by name", () => {
  const result = validateEdition(
    broken((e) => {
      e.publishedBy = "Paulo";
    })
  );
  assert.ok(
    result.errors.includes('$: a propriedade "publishedBy" não é reconhecida'),
    result.errors.join("\n")
  );
});

test("a wrong type is reported in Portuguese", () => {
  const result = validateEdition(
    broken((e) => {
      e.sections[2].indicators[0].value = "3.4";
    })
  );
  assert.ok(
    result.errors.includes("sections[2].indicators[0].value: deve ser número"),
    result.errors.join("\n")
  );
});

test("a value that breaks a pattern is quoted with the pattern", () => {
  const result = validateEdition(
    broken((e) => {
      e.version = "1";
    })
  );
  const [message] = errorsOn(result, "version");
  assert.match(message, /^version: valor "1" não respeita o formato exigido \(/);
});

test("an empty localised string is rejected by the schema and by the walk", () => {
  const result = validateEdition(
    broken((e) => {
      e.title.en = "";
    })
  );
  assert.ok(result.errors.includes("title.en: não pode estar vazio"), result.errors.join("\n"));
  assert.ok(result.errors.includes("title.en: está vazio"), result.errors.join("\n"));
});

/* ------------------------------------------------------------ id ↔ period */

test("the month in the id must match period.month", () => {
  const result = validateEdition(
    broken((e) => {
      e.period.month = 6;
    })
  );
  assert.ok(
    result.errors.includes('period.month: 6 não corresponde ao id "2026-07" (esperado 7)'),
    result.errors.join("\n")
  );
});

test("the year in the id must match period.year", () => {
  const result = validateEdition(
    broken((e) => {
      e.period.year = 2025;
    })
  );
  assert.ok(
    result.errors.includes('period.year: 2025 não corresponde ao id "2026-07" (esperado 2026)'),
    result.errors.join("\n")
  );
});

test("a quarterly id demands the quarterly horizon and a quarter", () => {
  const result = validateEdition(
    broken((e) => {
      e.id = "2026-Q3";
    })
  );
  assert.ok(
    result.errors.includes('horizon: "monthly" não corresponde ao id "2026-Q3" (esperado "quarterly")'),
    result.errors.join("\n")
  );
  assert.ok(
    result.errors.includes('period.month: não se aplica ao id "2026-Q3" (horizonte "quarterly")'),
    result.errors.join("\n")
  );
  assert.ok(
    result.errors.includes('period.quarter: em falta; o id "2026-Q3" indica 3'),
    result.errors.join("\n")
  );
});

test("horizonFromId covers every accepted id shape", () => {
  assert.equal(horizonFromId("2025-03"), "monthly");
  assert.equal(horizonFromId("2025-Q1"), "quarterly");
  assert.equal(horizonFromId("2025-H1"), "half-year");
  assert.equal(horizonFromId("2025"), "annual");
  assert.equal(horizonFromId("2025-13"), null);
  assert.equal(horizonFromId("nope"), null);
});

/* --------------------------------------------------------------- takeaway */

test("a takeaway over 45 words is an error naming the count", () => {
  const result = validateEdition(
    broken((e) => {
      e.takeaway.pt = Array.from({ length: 46 }, (_, i) => `palavra${i}`).join(" ");
    })
  );
  assert.ok(
    result.errors.includes("takeaway.pt: tem 46 palavras (máximo 45)"),
    result.errors.join("\n")
  );
});

/* -------------------------------------------------------- PT + EN complete */

test("a missing language in a localised field is reported by path", () => {
  const result = validateEdition(
    broken((e) => {
      delete e.sections[6].lens.implication.en;
    })
  );
  assert.ok(
    result.errors.includes('sections[6].lens.implication: falta a versão "en"'),
    result.errors.join("\n")
  );
});

/* -------------------------------------------------------------- PDF names */

test("a PDF name that breaks the pattern is rejected", () => {
  const result = validateEdition(
    broken((e) => {
      e.pdf.pt = "brief-julho.pdf";
    })
  );
  assert.ok(
    result.errors.some((m) =>
      m.startsWith('pdf.pt: "brief-julho.pdf" não segue o padrão THB_[Horizonte]')
    ),
    result.errors.join("\n")
  );
});

test("the horizon token inside the PDF name must match `horizon`", () => {
  const result = validateEdition(
    broken((e) => {
      e.pdf.en = "THB_Quarterly_2026-07_EN_PDF_v1.0.pdf";
    })
  );
  assert.ok(
    result.errors.includes(
      'pdf.en: o horizonte "Quarterly" no nome do ficheiro não corresponde a horizon "monthly" (esperado "Monthly")'
    ),
    result.errors.join("\n")
  );
});

test("the period token inside the PDF name must match the id", () => {
  const result = validateEdition(
    broken((e) => {
      e.pdf.pt = "THB_Monthly_2026-06_PT_PDF_v1.0.pdf";
    })
  );
  assert.ok(
    result.errors.includes(
      'pdf.pt: o período "2026-06" no nome do ficheiro não corresponde ao id "2026-07"'
    ),
    result.errors.join("\n")
  );
});

test("the language token inside the PDF name must match the field", () => {
  const result = validateEdition(
    broken((e) => {
      e.pdf.pt = "THB_Monthly_2026-07_EN_PDF_v1.0.pdf";
    })
  );
  assert.ok(
    result.errors.includes('pdf.pt: o idioma "EN" no nome do ficheiro deveria ser "PT"'),
    result.errors.join("\n")
  );
});

test("a PDF listed in the JSON but absent from the folder is an error", () => {
  const result = validateEdition(JULY, { pdfNamesPresent: [JULY.pdf.pt] });
  assert.ok(
    result.errors.includes(`pdf.en: o ficheiro "${JULY.pdf.en}" não foi encontrado`),
    result.errors.join("\n")
  );
  assert.equal(result.errors.length, 1);
});

test("`pdfNamesPresent` omitted skips the presence check entirely", () => {
  const result = validateEdition(JULY);
  assert.deepEqual(result.errors, []);
});

test("expectedPdfName builds the name the validator asks for", () => {
  assert.equal(expectedPdfName(JULY, "pt"), JULY.pdf.pt);
  assert.equal(expectedPdfName(JULY, "en"), JULY.pdf.en);
  assert.equal(
    expectedPdfName({ id: "2025-Q1", horizon: "quarterly" }, "en"),
    "THB_Quarterly_2025-Q1_EN_PDF_v1.0.pdf"
  );
  assert.equal(expectedPdfName({ id: "2025", horizon: undefined }, "pt"), null);
});

/* -------------------------------------------------------------- warnings */

test("a late publication without `historical` warns but does not block", () => {
  const result = validateEdition(
    broken((e) => {
      e.id = "2025-01";
      e.period.year = 2025;
      e.period.month = 1;
      e.pdf.pt = "THB_Monthly_2025-01_PT_PDF_v1.0.pdf";
      e.pdf.en = "THB_Monthly_2025-01_EN_PDF_v1.0.pdf";
    })
  );
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /^publishedAt: está \d+ dias depois do fim do período/);
  assert.match(result.warnings[0], /considere "historical": true/);
});

test("`historical: true` silences the lag warning", () => {
  const result = validateEdition(
    broken((e) => {
      e.id = "2025-01";
      e.period.year = 2025;
      e.period.month = 1;
      e.historical = true;
      e.pdf.pt = "THB_Monthly_2025-01_PT_PDF_v1.0.pdf";
      e.pdf.en = "THB_Monthly_2025-01_EN_PDF_v1.0.pdf";
    })
  );
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test("a historicalNote without the flag warns that it will not be shown", () => {
  const result = validateEdition(
    broken((e) => {
      e.historicalNote = { pt: "Dados revistos.", en: "Revised data." };
    })
  );
  assert.deepEqual(result.errors, []);
  assert.ok(
    result.warnings.includes(
      'historicalNote: está definido sem "historical": true — a nota não será mostrada'
    ),
    result.warnings.join("\n")
  );
});

test("publicationLagDays measures from the end of the period", () => {
  assert.equal(
    publicationLagDays({ horizon: "monthly", period: { year: 2026, month: 7 }, publishedAt: "2026-08-01" }),
    1
  );
  assert.equal(
    publicationLagDays({ horizon: "annual", period: { year: 2025 }, publishedAt: "2026-01-31" }),
    31
  );
  assert.equal(publicationLagDays({ horizon: "monthly", period: {} }), null);
});

/* --------------------------------------------------------------- helpers */

test("jsonPath turns a JSON Pointer into the path shown to the reader", () => {
  assert.equal(jsonPath(""), "$");
  assert.equal(jsonPath("/sections/2/indicators/0/change/unit"), "sections[2].indicators[0].change.unit");
  assert.equal(jsonPath("/pdf/pt"), "pdf.pt");
});

test("compareVersions orders major.minor strings", () => {
  assert.ok(compareVersions("1.1", "1.0") > 0);
  assert.ok(compareVersions("2.0", "1.9") > 0);
  assert.equal(compareVersions("1.0", "1.0"), 0);
  assert.ok(compareVersions("1.0", "1.1") < 0);
  assert.ok(compareVersions("1.0", "") > 0);
});
