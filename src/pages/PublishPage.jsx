import { useCallback, useMemo, useRef, useState } from "react";
import { Box, Button, Link as MuiLink, TextField, Typography } from "@mui/material";
import { useHead } from "../lib/head";
import { formatPeriod } from "../lib/format";
import Rule from "../knowledge-centre/components/Rule";
import { READING_WIDTH } from "../knowledge-centre/theme";

/**
 * «Publicar edição» — Paulo's private upload page for the Tourism & Hospitality
 * Brief. Portuguese only, noindex, absent from the sitemap and from the menu.
 *
 * Three panels, one at a time: sign in, choose and check the files, send them.
 * Everything that can be checked before an upload is checked in the browser by
 * the same module the build and the functions use
 * (`src/lib/edition-validation.mjs`), so the page can be specific about what is
 * wrong without a round trip. The module is imported lazily, in an event
 * handler, which keeps Ajv out of the bundle every other visitor downloads and
 * out of the pre-render.
 *
 * Nothing here reaches the live site: the upload ends in a pull request that
 * Rui reviews and merges.
 */

const FUNCTIONS = "/.netlify/functions";

/** Mirrors netlify/functions/_lib/http.mjs — keep the two in step. */
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = Math.round(5.5 * 1024 * 1024);
/**
 * Files travel as base64 inside a JSON body, which inflates them by 4/3, so a
 * PDF stops fitting in one request at about 4 MB — well before MAX_PDF_BYTES.
 * Saying so here is much kinder than a 413 halfway through the upload.
 */
const fitsInRequest = (bytes) => Math.ceil(bytes / 3) * 4 + 512 <= MAX_REQUEST_BYTES;

const HORIZON_LABELS = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  "half-year": "Semestral",
  annual: "Anual",
};

const STATE_LABELS = {
  new: "Edição nova — ainda não existe no site.",
  pending: "Edição já enviada anteriormente; os ficheiros vão ser substituídos no mesmo pedido.",
  published: "Edição já publicada no site. Só é aceite com um número de versão superior.",
};

const megabytes = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;

/** POST to a publish function; a non-2xx becomes an Error with the server text. */
async function callFunction(name, body) {
  const response = await fetch(`${FUNCTIONS}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.error || `O servidor respondeu ${response.status}.`);
    error.details = Array.isArray(data.errors) ? data.errors : [];
    throw error;
  }
  return data;
}

/** ArrayBuffer -> base64, in chunks so a few MB do not overflow the stack. */
function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/* -------------------------------------------------------------------------- */
/* Presentational pieces                                                      */
/* -------------------------------------------------------------------------- */

function Panel({ label, title, children, sx }) {
  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        backgroundColor: "thb.white",
        border: "1px solid",
        borderColor: "thb.beige",
        borderTop: "2px solid",
        borderTopColor: "thb.petroleum",
        px: { xs: 2.5, sm: 4, md: 5 },
        py: { xs: 3.5, md: 5 },
        ...sx,
      }}
    >
      <Typography variant="overline" component="p" sx={{ m: 0, color: "thb.greyGreen" }}>
        {label}
      </Typography>
      <Rule width={22} sx={{ mt: 1.5 }} />
      <Typography variant="h2" component="h2" sx={{ mt: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function PrimaryButton({ children, sx, ...props }) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        backgroundColor: "thb.petroleum",
        color: "thb.ivory",
        borderRadius: 0,
        minHeight: 44,
        px: 3.5,
        fontSize: "1rem",
        "&:hover": { backgroundColor: "thb.petroleum", opacity: 0.9 },
        "&.Mui-disabled": { backgroundColor: "thb.beige", color: "thb.greyGreen" },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

function QuietButton({ children, sx, ...props }) {
  return (
    <Button
      variant="outlined"
      {...props}
      sx={{
        borderRadius: 0,
        minHeight: 44,
        px: 2.5,
        color: "thb.petroleum",
        borderColor: "thb.beige",
        fontSize: "0.9375rem",
        "&:hover": { borderColor: "thb.petroleum", backgroundColor: "transparent" },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

/** A list of messages under a heading; nothing is rendered when it is empty. */
function MessageList({ title, messages, tone = "error" }) {
  if (!messages?.length) return null;
  const color = tone === "error" ? "thb.negative" : "thb.greyGreen";
  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography
        component="p"
        sx={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color }}
      >
        {title}
      </Typography>
      <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5, display: "grid", gap: 0.75 }}>
        {messages.map((message) => (
          <Typography
            key={message}
            component="li"
            sx={{ fontSize: "0.9375rem", lineHeight: 1.55, color: "thb.petroleum" }}
          >
            {message}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/** One label/value row of the summary. */
function SummaryRow({ label, children }) {
  return (
    <>
      <Typography
        component="dt"
        sx={{ fontSize: "0.8125rem", color: "thb.greyGreen", py: 0.75 }}
      >
        {label}
      </Typography>
      <Typography
        component="dd"
        sx={{ m: 0, fontSize: "0.9375rem", color: "thb.petroleum", py: 0.75, wordBreak: "break-word" }}
      >
        {children}
      </Typography>
    </>
  );
}

/** A file input with its label, the chosen file and any problem with it. */
function FileField({ id, label, accept, hint, file, problems, onChange, action }) {
  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Typography component="label" htmlFor={id} sx={{ fontSize: "0.9375rem", fontWeight: 600 }}>
        {label}
      </Typography>
      <Box
        component="input"
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        sx={{
          fontFamily: "inherit",
          fontSize: "0.9375rem",
          color: "thb.petroleum",
          minHeight: 44,
          "&::file-selector-button": {
            font: "inherit",
            minHeight: 40,
            px: 2,
            mr: 2,
            border: "1px solid",
            borderColor: "thb.beige",
            borderRadius: 0,
            backgroundColor: "thb.ivory",
            color: "thb.petroleum",
            cursor: "pointer",
          },
        }}
      />
      {hint ? (
        <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
          {hint}
        </Typography>
      ) : null}
      {file ? (
        <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
          {file.name} · {megabytes(file.size)}
        </Typography>
      ) : null}
      {problems?.map((problem) => (
        <Typography
          key={problem}
          component="p"
          sx={{ fontSize: "0.875rem", color: "thb.negative" }}
        >
          {problem}
        </Typography>
      ))}
      {action}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

const UPLOAD_STEPS = [
  { key: "json", label: "Ficheiro JSON da edição" },
  { key: "pdfPt", label: "PDF em português" },
  { key: "pdfEn", label: "PDF em inglês" },
  { key: "pr", label: "Pedido de publicação" },
];

const STEP_STATUS = {
  idle: "por enviar",
  running: "a enviar…",
  done: "enviado",
  error: "falhou",
};

export default function PublishPage() {
  useHead({
    title: "Publicar edição | Paulo Braga Real Estate",
    lang: "pt",
    robots: "noindex, nofollow",
  });

  const [step, setStep] = useState("login");

  // ------------------------------------------------------------ sign in
  const [passphrase, setPassphrase] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // ------------------------------------------------------------- files
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonError, setJsonError] = useState("");
  const [local, setLocal] = useState(null); // { errors, warnings, derived }
  const [pdfPt, setPdfPt] = useState(null);
  const [pdfEn, setPdfEn] = useState(null);
  const [renamePt, setRenamePt] = useState(false);
  const [renameEn, setRenameEn] = useState(false);
  const [server, setServer] = useState(null); // publish-validate response
  const [serverError, setServerError] = useState("");
  const [checking, setChecking] = useState(false);

  // -------------------------------------------------------------- send
  const [statuses, setStatuses] = useState({});
  const [sendError, setSendError] = useState(null); // { key, message, details }
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  // The parsed edition never re-renders anything, so it lives in a ref.
  const editionRef = useRef(null);

  const derived = local?.derived ?? null;
  const id = derived?.id ?? null;
  const expected = useMemo(
    () => ({ pt: derived?.pdfNames?.pt ?? null, en: derived?.pdfNames?.en ?? null }),
    [derived]
  );

  /** Everything wrong with one chosen PDF, in the order Paulo should fix it. */
  const pdfProblems = useCallback(
    (file, expectedName, renamed) => {
      if (!file) return [];
      const problems = [];
      if (file.size > MAX_PDF_BYTES) {
        problems.push(`O ficheiro tem ${megabytes(file.size)}; o máximo é 5 MB.`);
      } else if (!fitsInRequest(file.size)) {
        problems.push(
          `O ficheiro tem ${megabytes(file.size)} e não cabe num envio (o limite prático ` +
            `é cerca de 4 MB). Comprima o PDF e escolha-o outra vez.`
        );
      }
      if (expectedName && file.name !== expectedName && !renamed) {
        problems.push(`O nome devia ser "${expectedName}".`);
      }
      return problems;
    },
    []
  );

  const ptProblems = pdfProblems(pdfPt, expected.pt, renamePt);
  const enProblems = pdfProblems(pdfEn, expected.en, renameEn);

  const readyToSend =
    Boolean(id) &&
    Boolean(jsonFile) &&
    Boolean(pdfPt) &&
    Boolean(pdfEn) &&
    local?.errors?.length === 0 &&
    ptProblems.length === 0 &&
    enProblems.length === 0 &&
    Boolean(server) &&
    server.errors.length === 0;

  /* ------------------------------------------------------------ actions */

  async function handleSignIn(event) {
    event.preventDefault();
    setLoginError("");
    setSigningIn(true);
    try {
      await callFunction("publish-login", { passphrase });
      setPassphrase("");
      setStep("files");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    try {
      await callFunction("publish-logout", {});
    } catch {
      // Signing out is best-effort: the cookie expires on its own.
    }
    setStep("login");
    setJsonFile(null);
    setLocal(null);
    setServer(null);
    setPdfPt(null);
    setPdfEn(null);
    setResult(null);
    setStatuses({});
  }

  async function handleJsonChange(event) {
    const file = event.target.files?.[0] ?? null;
    setJsonFile(file);
    setLocal(null);
    setServer(null);
    setServerError("");
    setJsonError("");
    editionRef.current = null;
    if (!file) return;

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch (error) {
      setJsonError(`O ficheiro não é JSON válido — ${error.message}`);
      return;
    }

    // Loaded here rather than at the top of the file: Ajv is ~120 kB and no
    // other page needs it.
    const { validateEdition } = await import("../lib/edition-validation.mjs");
    editionRef.current = parsed;
    setLocal(validateEdition(parsed));
  }

  function handlePdfChange(lang) {
    return (event) => {
      const file = event.target.files?.[0] ?? null;
      if (lang === "pt") {
        setPdfPt(file);
        setRenamePt(false);
      } else {
        setPdfEn(file);
        setRenameEn(false);
      }
      setServer(null);
    };
  }

  async function handleServerCheck() {
    if (!editionRef.current) return;
    setChecking(true);
    setServerError("");
    setServer(null);
    try {
      setServer(await callFunction("publish-validate", { edition: editionRef.current }));
    } catch (error) {
      setServerError(error.message);
    } finally {
      setChecking(false);
    }
  }

  /** Run the upload steps from `from` onwards, stopping at the first failure. */
  const runFrom = useCallback(
    async (from) => {
      setSending(true);
      setSendError(null);

      const plan = {
        json: async () => {
          const content = toBase64(await jsonFile.arrayBuffer());
          return callFunction("publish-upload", {
            id,
            kind: "json",
            filename: `${id}.json`,
            contentBase64: content,
          });
        },
        pdfPt: async () => {
          const content = toBase64(await pdfPt.arrayBuffer());
          return callFunction("publish-upload", {
            id,
            kind: "pdf-pt",
            filename: expected.pt ?? pdfPt.name,
            contentBase64: content,
          });
        },
        pdfEn: async () => {
          const content = toBase64(await pdfEn.arrayBuffer());
          return callFunction("publish-upload", {
            id,
            kind: "pdf-en",
            filename: expected.en ?? pdfEn.name,
            contentBase64: content,
          });
        },
        pr: async () => {
          const done = await callFunction("publish-finish", { id });
          setResult(done);
          return done;
        },
      };

      const start = UPLOAD_STEPS.findIndex((s) => s.key === from);
      for (const { key } of UPLOAD_STEPS.slice(Math.max(start, 0))) {
        setStatuses((current) => ({ ...current, [key]: "running" }));
        try {
          await plan[key]();
          setStatuses((current) => ({ ...current, [key]: "done" }));
        } catch (error) {
          setStatuses((current) => ({ ...current, [key]: "error" }));
          setSendError({ key, message: error.message, details: error.details ?? [] });
          setSending(false);
          return;
        }
      }
      setSending(false);
    },
    [id, jsonFile, pdfPt, pdfEn, expected]
  );

  function handleSend() {
    setStatuses(Object.fromEntries(UPLOAD_STEPS.map((s) => [s.key, "idle"])));
    setResult(null);
    setStep("send");
    runFrom("json");
  }

  /* -------------------------------------------------------------- render */

  return (
    <Box
      component="main"
      lang="pt"
      sx={{ backgroundColor: "thb.ivory", pt: { xs: 3, md: 4.5 }, pb: { xs: 8, md: 12 } }}
    >
      <Box
        sx={{
          maxWidth: 880,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "grid",
          gap: { xs: 4, md: 6 },
        }}
      >
        <Box component="header">
          <Typography variant="overline" component="p" sx={{ color: "thb.greyGreen" }}>
            Tourism &amp; Hospitality Brief
          </Typography>
          <Typography variant="h1" component="h1" sx={{ mt: { xs: 1.5, md: 2 } }}>
            Publicar edição
          </Typography>
          <Box sx={{ mt: { xs: 2, md: 2.5 }, height: "1px", backgroundColor: "thb.terracotta" }} />
          <Typography
            component="p"
            sx={{
              mt: { xs: 2, md: 2.5 },
              fontSize: { xs: "0.9375rem", sm: "1rem" },
              lineHeight: 1.68,
              color: "thb.greyGreen",
              maxWidth: READING_WIDTH,
            }}
          >
            Envie o ficheiro JSON da edição e os dois PDFs. Os ficheiros são verificados
            antes do envio e ficam num pedido de publicação — a edição só fica pública
            depois de o Rui o aprovar.
          </Typography>
        </Box>

        {/* ------------------------------------------------- 1. entrar */}
        {step === "login" ? (
          <Panel label="Passo 1 de 3" title="Entrar">
            <Box
              component="form"
              onSubmit={handleSignIn}
              sx={{ mt: 3, display: "grid", gap: 2.5, maxWidth: 420 }}
            >
              <TextField
                id="publicar-frase"
                label="Frase de acesso"
                type="password"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                autoComplete="off"
                slotProps={{ input: { sx: { borderRadius: 0 } } }}
              />
              <Box>
                <PrimaryButton type="submit" disabled={signingIn || passphrase.length === 0}>
                  {signingIn ? "A entrar…" : "Entrar"}
                </PrimaryButton>
              </Box>
              <Box aria-live="polite">
                {loginError ? (
                  <Typography component="p" sx={{ fontSize: "0.9375rem", color: "thb.negative" }}>
                    {loginError}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Panel>
        ) : null}

        {/* ----------------------------------------------- 2. ficheiros */}
        {step === "files" ? (
          <Panel label="Passo 2 de 3" title="Ficheiros">
            <Box sx={{ mt: 3, display: "grid", gap: 3.5 }}>
              <FileField
                id="publicar-json"
                label="Ficheiro JSON da edição"
                accept="application/json,.json"
                hint="O ficheiro da edição, por exemplo 2026-07.json."
                file={jsonFile}
                problems={jsonError ? [jsonError] : []}
                onChange={handleJsonChange}
              />

              {derived ? (
                <Box
                  aria-live="polite"
                  sx={{
                    border: "1px solid",
                    borderColor: "thb.beige",
                    backgroundColor: "thb.ivory",
                    px: { xs: 2, md: 3 },
                    py: { xs: 2, md: 2.5 },
                  }}
                >
                  <Typography variant="h3" component="h3">
                    {derived.title ?? "Edição sem título"}
                  </Typography>
                  <Box
                    component="dl"
                    sx={{
                      m: 0,
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "12rem minmax(0, 1fr)" },
                      columnGap: 2,
                    }}
                  >
                    <SummaryRow label="Identificador">{derived.id ?? "—"}</SummaryRow>
                    <SummaryRow label="Horizonte">
                      {HORIZON_LABELS[derived.horizon] ?? derived.horizon ?? "—"}
                    </SummaryRow>
                    <SummaryRow label="Período">
                      {derived.period
                        ? formatPeriod({ horizon: derived.horizon, period: derived.period }, "pt")
                        : "—"}
                    </SummaryRow>
                    <SummaryRow label="Versão">{derived.version ?? "—"}</SummaryRow>
                    <SummaryRow label="Edição histórica">
                      {derived.historical ? "Sim" : "Não"}
                    </SummaryRow>
                    <SummaryRow label="PDF em português">{expected.pt ?? "—"}</SummaryRow>
                    <SummaryRow label="PDF em inglês">{expected.en ?? "—"}</SummaryRow>
                  </Box>

                  <MessageList title="Erros a corrigir" messages={local.errors} />
                  <MessageList title="Avisos" messages={local.warnings} tone="warning" />

                  {local.errors.length === 0 ? (
                    <Typography
                      component="p"
                      sx={{ mt: 2.5, fontSize: "0.9375rem", color: "thb.positive" }}
                    >
                      O ficheiro passou em todas as verificações locais.
                    </Typography>
                  ) : null}
                </Box>
              ) : null}

              <FileField
                id="publicar-pdf-pt"
                label="PDF em português"
                accept="application/pdf,.pdf"
                hint={expected.pt ? `Nome esperado: ${expected.pt}` : "Escolha primeiro o ficheiro JSON."}
                file={pdfPt}
                problems={ptProblems}
                onChange={handlePdfChange("pt")}
                action={
                  pdfPt && expected.pt && pdfPt.name !== expected.pt && !renamePt ? (
                    <Box>
                      <QuietButton onClick={() => setRenamePt(true)}>
                        Renomear automaticamente
                      </QuietButton>
                    </Box>
                  ) : renamePt ? (
                    <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                      Vai ser enviado como {expected.pt}.
                    </Typography>
                  ) : null
                }
              />

              <FileField
                id="publicar-pdf-en"
                label="PDF em inglês"
                accept="application/pdf,.pdf"
                hint={expected.en ? `Nome esperado: ${expected.en}` : "Escolha primeiro o ficheiro JSON."}
                file={pdfEn}
                problems={enProblems}
                onChange={handlePdfChange("en")}
                action={
                  pdfEn && expected.en && pdfEn.name !== expected.en && !renameEn ? (
                    <Box>
                      <QuietButton onClick={() => setRenameEn(true)}>
                        Renomear automaticamente
                      </QuietButton>
                    </Box>
                  ) : renameEn ? (
                    <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                      Vai ser enviado como {expected.en}.
                    </Typography>
                  ) : null
                }
              />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                <QuietButton
                  onClick={handleServerCheck}
                  disabled={checking || !derived || local.errors.length > 0}
                >
                  {checking ? "A verificar…" : "Validar no servidor"}
                </QuietButton>
                <PrimaryButton onClick={handleSend} disabled={!readyToSend}>
                  Enviar
                </PrimaryButton>
              </Box>

              <Box aria-live="polite">
                {serverError ? (
                  <Typography component="p" sx={{ fontSize: "0.9375rem", color: "thb.negative" }}>
                    {serverError}
                  </Typography>
                ) : null}

                {server ? (
                  <Box>
                    <Typography
                      component="p"
                      sx={{
                        fontSize: "0.9375rem",
                        color: server.errors.length ? "thb.negative" : "thb.petroleum",
                      }}
                    >
                      {STATE_LABELS[server.state] ?? server.state}
                    </Typography>
                    {server.prUrl ? (
                      <Typography component="p" sx={{ mt: 1, fontSize: "0.9375rem" }}>
                        <MuiLink href={server.prUrl} target="_blank" rel="noreferrer">
                          Ver o pedido de publicação em curso
                        </MuiLink>
                      </Typography>
                    ) : null}
                    <MessageList title="Erros a corrigir" messages={server.errors} />
                    <MessageList title="Avisos" messages={server.warnings} tone="warning" />
                    {server.errors.length === 0 ? (
                      <Typography
                        component="p"
                        sx={{ mt: 2, fontSize: "0.9375rem", color: "thb.positive" }}
                      >
                        Tudo pronto. Pode enviar.
                      </Typography>
                    ) : null}
                  </Box>
                ) : (
                  <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                    Valide no servidor antes de enviar.
                  </Typography>
                )}
              </Box>
            </Box>
          </Panel>
        ) : null}

        {/* --------------------------------------------------- 3. envio */}
        {step === "send" ? (
          <Panel label="Passo 3 de 3" title="Envio">
            <Box component="ol" sx={{ m: 0, mt: 3, p: 0, listStyle: "none", display: "grid" }} aria-live="polite">
              {UPLOAD_STEPS.map(({ key, label }) => {
                const status = statuses[key] ?? "idle";
                return (
                  <Box
                    component="li"
                    key={key}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      py: 2,
                      borderTop: "1px solid",
                      borderColor: "thb.beige",
                      "&:last-of-type": { borderBottom: "1px solid", borderColor: "thb.beige" },
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: "0.9375rem" }}>
                      {label}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.875rem",
                        color:
                          status === "error"
                            ? "thb.negative"
                            : status === "done"
                              ? "thb.positive"
                              : "thb.greyGreen",
                      }}
                    >
                      {STEP_STATUS[status]}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box aria-live="polite" sx={{ mt: 3 }}>
              {sendError ? (
                <Box>
                  <Typography component="p" sx={{ fontSize: "0.9375rem", color: "thb.negative" }}>
                    {sendError.message}
                  </Typography>
                  <MessageList title="Erros a corrigir" messages={sendError.details} />
                  <Box sx={{ mt: 2.5, display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <PrimaryButton onClick={() => runFrom(sendError.key)} disabled={sending}>
                      Tentar de novo
                    </PrimaryButton>
                    <QuietButton onClick={() => setStep("files")} disabled={sending}>
                      Voltar aos ficheiros
                    </QuietButton>
                  </Box>
                </Box>
              ) : null}

              {result ? (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "thb.beige",
                    backgroundColor: "thb.ivory",
                    px: { xs: 2, md: 3 },
                    py: { xs: 2, md: 2.5 },
                  }}
                >
                  <Rule width={44} />
                  <Typography variant="h3" component="h3" sx={{ mt: 2 }}>
                    Edição enviada. O pedido de publicação é o n.º {result.prNumber}.
                  </Typography>
                  <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
                    <Typography component="p" sx={{ fontSize: "0.9375rem" }}>
                      <MuiLink href={result.prUrl} target="_blank" rel="noreferrer">
                        Ver o pedido de publicação
                      </MuiLink>
                    </Typography>
                    <Typography component="p" sx={{ fontSize: "0.9375rem" }}>
                      <MuiLink href={result.previewUrl} target="_blank" rel="noreferrer">
                        Ver a pré-visualização da edição
                      </MuiLink>
                    </Typography>
                    <Typography variant="caption" component="p" sx={{ color: "thb.greyGreen" }}>
                      A pré-visualização fica pronta em cerca de dois minutos.
                    </Typography>
                  </Box>
                  <Typography component="p" sx={{ mt: 2.5, fontSize: "0.9375rem" }}>
                    A edição só fica pública depois de o Rui aprovar.
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Panel>
        ) : null}

        {step !== "login" ? (
          <Box>
            <Button
              onClick={handleSignOut}
              sx={{
                p: 0,
                minHeight: 44,
                borderRadius: 0,
                textTransform: "none",
                fontSize: "0.9375rem",
                color: "thb.greyGreen",
                "&:hover": { backgroundColor: "transparent", color: "thb.petroleum" },
              }}
            >
              Sair
            </Button>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
