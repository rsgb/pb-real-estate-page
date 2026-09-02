/**
 * Knowledge Centre interface strings.
 *
 * Two audiences, two languages:
 *  - `ui(siteLang)`       chrome (navigation, buttons, archive) in the visitor's
 *                         site language, including ES and FR.
 *  - `contentUi(lang)`    labels that sit *inside* the editorial content
 *                         (lens sub-blocks, source line, data status). The Brief
 *                         is authored only in PT and EN, so these follow the
 *                         content language and never drift from the article.
 *
 * Series, author and methodology copy is Paulo's approved v1.0 institutional
 * text, verbatim. ES and FR inherit the English copy and carry the notice.
 */

const pt = {
  seriesName: "Tourism & Hospitality Brief",
  seriesTagline:
    "O Tourism & Hospitality Brief é uma publicação de inteligência de mercado sobre o desempenho do turismo e da hotelaria em Portugal. Transforma dados oficiais em leituras claras sobre procura, receita, desempenho regional e implicações para investidores, proprietários e operadores de ativos hoteleiros.",
  knowledgeCentre: "Knowledge Centre",
  latestEdition: "Edição mais recente",
  latestBadge: "Mais recente",
  archive: "Arquivo",
  allEditions: "Todas as edições",
  horizons: {
    monthly: "Mensal",
    quarterly: "Trimestral",
    "half-year": "Semestral",
    annual: "Anual",
  },
  executiveTakeaway: "Conclusão executiva",
  keyIndicators: "Indicadores-chave",
  readMethodology: "Ler a metodologia",
  methodology: "Metodologia",
  downloadPdf: "Descarregar PDF",
  previousEdition: "Edição anterior",
  nextEdition: "Edição seguinte",
  backToSeries: "Voltar à série",
  showDataTable: "Mostrar tabela de dados",
  hideDataTable: "Ocultar tabela de dados",
  source: "Fonte",
  sources: "Fontes",
  primarySource: "Fonte primária",
  complementarySources: "Fontes complementares",
  releaseDate: "Data de divulgação",
  notes: "Notas",
  publishedOn: "Publicado a",
  dataStatusLabel: "Estado dos dados",
  language: "Idioma",
  country: "Portugal",
  readEdition: "Ler a edição",
  scrollTableHint: "Tabela com deslocamento horizontal",
  tableItemHeader: "Categoria",
  tableValueHeader: "Valor",
  dataStatus: {
    provisional: "Dados provisórios",
    revised: "Dados revistos",
    estimated: "Dados estimados",
    final: "Dados finais",
  },
  lens: {
    title: "Tourism & Hospitality Real Estate Lens",
    fact: "Facto",
    interpretation: "Interpretação",
    implication: "Implicação",
  },
  outlookTitle: "Perspetiva futura",
  notFoundTitle: "Edição não encontrada",
  notFoundBody:
    "Não foi possível encontrar esta edição. Consulte o arquivo da série para ver as edições disponíveis.",
  availability: "Esta edição está disponível em português e inglês.",
  author: {
    name: "Paulo Braga",
    role: "Hospitality Real Estate Advisor",
    bio:
      "Paulo Braga é Hospitality Real Estate Advisor. Analisa o mercado turístico e hoteleiro português com especial enfoque no investimento, no desempenho dos ativos, na microlocalização e na qualidade sustentável da receita.",
  },
  methodologyParagraphs: [
    "O Tourism & Hospitality Brief utiliza prioritariamente dados oficiais do Instituto Nacional de Estatística, complementados, quando relevante, por informação do Turismo de Portugal, TravelBI, Banco de Portugal e outras fontes identificadas em cada edição. Os valores podem ser provisórios, revistos, estimados ou finais, conforme indicado.",
    "As variações são homólogas, salvo indicação em contrário. As variações de taxas de ocupação são expressas em pontos percentuais. Os valores monetários e quantitativos são apresentados com a precisão adequada à leitura executiva; o ficheiro estruturado da edição preserva os valores numéricos de base e a respetiva unidade, escala e base de comparação.",
    "A Perspetiva Imobiliária distingue três níveis: facto, correspondente ao que os dados demonstram; interpretação, correspondente ao significado económico e operacional desses dados; e implicação, correspondente à sua relevância para investidores, proprietários e operadores. A análise não constitui aconselhamento financeiro, jurídico ou fiscal.",
  ]};

const en = {
  seriesName: "Tourism & Hospitality Brief",
  seriesTagline:
    "Tourism & Hospitality Brief is a market intelligence publication on the performance of tourism and hospitality in Portugal. It turns official data into clear insights on demand, revenue, regional performance and the implications for hotel investors, owners and operators.",
  knowledgeCentre: "Knowledge Centre",
  latestEdition: "Latest edition",
  latestBadge: "Latest",
  archive: "Archive",
  allEditions: "All editions",
  horizons: {
    monthly: "Monthly",
    quarterly: "Quarterly",
    "half-year": "Half-year",
    annual: "Annual",
  },
  executiveTakeaway: "Executive takeaway",
  keyIndicators: "Key indicators",
  readMethodology: "Read the methodology",
  methodology: "Methodology",
  downloadPdf: "Download PDF",
  previousEdition: "Previous edition",
  nextEdition: "Next edition",
  backToSeries: "Back to series",
  showDataTable: "Show data table",
  hideDataTable: "Hide data table",
  source: "Source",
  sources: "Sources",
  primarySource: "Primary source",
  complementarySources: "Complementary sources",
  releaseDate: "Release date",
  notes: "Notes",
  publishedOn: "Published on",
  dataStatusLabel: "Data status",
  language: "Language",
  country: "Portugal",
  readEdition: "Read the edition",
  scrollTableHint: "Horizontally scrollable table",
  tableItemHeader: "Category",
  tableValueHeader: "Value",
  dataStatus: {
    provisional: "Provisional data",
    revised: "Revised data",
    estimated: "Estimated data",
    final: "Final data",
  },
  lens: {
    title: "Tourism & Hospitality Real Estate Lens",
    fact: "Fact",
    interpretation: "Interpretation",
    implication: "Implication",
  },
  outlookTitle: "Outlook",
  notFoundTitle: "Edition not found",
  notFoundBody:
    "We could not find this edition. Please use the series archive to see the editions available.",
  availability: "This edition is available in English and Portuguese.",
  author: {
    name: "Paulo Braga",
    role: "Hospitality Real Estate Advisor",
    bio:
      "Paulo Braga is a Hospitality Real Estate Advisor. He analyses the Portuguese tourism and hospitality market, with a particular focus on investment, asset performance, micro-location and sustainable revenue quality.",
  },
  methodologyParagraphs: [
    "Tourism & Hospitality Brief relies primarily on official data from Statistics Portugal, supplemented where relevant by information from Turismo de Portugal, TravelBI, Banco de Portugal and other sources identified in each edition. Figures may be provisional, revised, estimated or final, as stated.",
    "Changes are year-on-year unless otherwise indicated. Changes in occupancy rates are expressed in percentage points. Monetary and quantitative figures are displayed with a level of precision appropriate for executive reading; the edition's structured data file preserves the underlying numeric values together with their unit, scale and comparison basis.",
    "The Real Estate Lens separates three levels: fact, reflecting what the data show; interpretation, explaining their economic and operating meaning; and implication, setting out their relevance for investors, owners and operators. The analysis does not constitute financial, legal or tax advice.",
  ]};

/** ES and FR visitors read the English edition, with an explicit notice. */
const es = {
  ...en,
  latestEdition: "Última edición",
  archive: "Archivo",
  allEditions: "Todas las ediciones",
  horizons: {
    monthly: "Mensual",
    quarterly: "Trimestral",
    "half-year": "Semestral",
    annual: "Anual",
  },
  executiveTakeaway: "Conclusión ejecutiva",
  keyIndicators: "Indicadores clave",
  readMethodology: "Leer la metodología",
  methodology: "Metodología",
  downloadPdf: "Descargar PDF",
  previousEdition: "Edición anterior",
  nextEdition: "Edición siguiente",
  backToSeries: "Volver a la serie",
  showDataTable: "Mostrar tabla de datos",
  hideDataTable: "Ocultar tabla de datos",
  readEdition: "Leer la edición",
  notFoundTitle: "Edición no encontrada",
  notFoundBody:
    "No hemos encontrado esta edición. Consulte el archivo de la serie para ver las ediciones disponibles.",
  languageNotice: "Este contenido está disponible en inglés.",
};

const fr = {
  ...en,
  latestEdition: "Dernière édition",
  archive: "Archives",
  allEditions: "Toutes les éditions",
  horizons: {
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    "half-year": "Semestriel",
    annual: "Annuel",
  },
  executiveTakeaway: "Conclusion exécutive",
  keyIndicators: "Indicateurs clés",
  readMethodology: "Lire la méthodologie",
  methodology: "Méthodologie",
  downloadPdf: "Télécharger le PDF",
  previousEdition: "Édition précédente",
  nextEdition: "Édition suivante",
  backToSeries: "Retour à la série",
  showDataTable: "Afficher le tableau de données",
  hideDataTable: "Masquer le tableau de données",
  readEdition: "Lire l'édition",
  notFoundTitle: "Édition introuvable",
  notFoundBody:
    "Cette édition est introuvable. Consultez les archives de la série pour voir les éditions disponibles.",
  languageNotice: "Ce contenu est disponible en anglais.",
};

export const UI = { pt, en, es, fr };

/** Chrome strings for the site language ("PT" | "EN" | "ES" | "FR"). */
export function ui(siteLang) {
  return UI[String(siteLang ?? "en").toLowerCase()] ?? UI.en;
}

/** Labels embedded in the editorial content; content is authored in PT or EN. */
export function contentUi(contentLang) {
  return contentLang === "pt" ? UI.pt : UI.en;
}

/** Notice shown to ES/FR visitors reading the English edition. */
export function languageNotice(siteLang) {
  return ui(siteLang).languageNotice ?? null;
}
