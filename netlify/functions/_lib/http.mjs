/**
 * Request/response plumbing shared by the publish endpoints.
 *
 * Rules that hold for every endpoint:
 *   - POST only, `application/json` only;
 *   - a body larger than MAX_BODY_BYTES is refused before it is parsed;
 *   - a missing environment variable is a 500 that says which variable is
 *     missing — never its value;
 *   - the client only ever sees a Portuguese `error` string. Stack traces and
 *     upstream response bodies stay in the function log.
 *
 * This directory is `_lib`, which Netlify never deploys as a function: a
 * subdirectory of the functions folder only becomes an endpoint when it holds
 * an `index` file or a file named after the directory, and there is neither.
 */

/**
 * Netlify's own request cap is 6 MB. Staying under it leaves room for the JSON
 * envelope around the base64 payload.
 *
 * Since D-34 the only file that travels through these endpoints is the edition
 * JSON, capped at 1 MB in publish-upload. The base64 arithmetic that used to
 * make 4 MB the practical ceiling for a PDF (MAX_PDF_BYTES, `fitsInRequest`)
 * went with the PDF uploads: an edition JSON is a few tens of kilobytes and
 * comes nowhere near this cap.
 */
export const MAX_BODY_BYTES = Math.round(5.5 * 1024 * 1024);

/** An error that is safe to show to the client, with the status to send. */
export class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} message Portuguese, shown to Paulo as-is
   * @param {object} [extra] additional JSON fields (e.g. `errors`)
   */
  constructor(status, message, extra) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.extra = extra ?? null;
  }
}

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  // The page is same-origin; nothing else may call these endpoints.
  "X-Robots-Tag": "noindex",
};

/**
 * JSON response in the Netlify Functions v1 shape.
 * @param {number} status
 * @param {object} body
 * @param {{cookies?: string[]}} [options]
 */
export function json(status, body, options = {}) {
  const response = {
    statusCode: status,
    headers: { ...BASE_HEADERS },
    body: JSON.stringify(body),
  };
  if (options.cookies?.length) response.multiValueHeaders = { "Set-Cookie": options.cookies };
  return response;
}

/** Value of an environment variable, or a 500 naming the missing one. */
export function requireEnv(name, env = process.env) {
  const value = env?.[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new HttpError(500, `Configuração em falta: ${name} não está definido no servidor.`);
  }
  return value;
}

/** Byte length of the raw request body, whatever transfer encoding was used. */
export function bodyByteLength(event) {
  const body = event?.body;
  if (typeof body !== "string" || body.length === 0) return 0;
  if (event.isBase64Encoded) return Math.floor((body.length * 3) / 4);
  return Buffer.byteLength(body, "utf8");
}

/**
 * Method guard + content-type guard + size guard + JSON parse.
 * @returns {object} the parsed body
 */
export function readJsonBody(event) {
  if ((event?.httpMethod ?? "").toUpperCase() !== "POST") {
    throw new HttpError(405, "Método não permitido; use POST.");
  }

  const headers = event.headers ?? {};
  const contentType = String(headers["content-type"] ?? headers["Content-Type"] ?? "");
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Tipo de conteúdo inválido; envie application/json.");
  }

  if (bodyByteLength(event) > MAX_BODY_BYTES) {
    throw new HttpError(413, "O pedido é demasiado grande (máximo 5,5 MB por envio).");
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : (event.body ?? "");

  if (!raw.trim()) throw new HttpError(400, "Pedido sem conteúdo.");

  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed;
  } catch {
    throw new HttpError(400, "O corpo do pedido não é JSON válido.");
  }
}

/**
 * Wrap a handler so every failure becomes a JSON `{error}` in Portuguese.
 * Anything that is not an HttpError is logged and answered with a generic 500,
 * so an upstream message can never leak a token or a path to the client.
 */
export function handle(fn) {
  return async (event, context) => {
    try {
      return await fn(event, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return json(error.status, { error: error.message, ...(error.extra ?? {}) });
      }
      console.error("publish: unhandled error", error?.message ?? error);
      return json(500, { error: "Erro inesperado no servidor. Tente de novo." });
    }
  };
}

/** Decode a base64 string, or refuse it. */
export function decodeBase64(value, label = "ficheiro") {
  if (typeof value !== "string" || value.length === 0) {
    throw new HttpError(400, `O ${label} está vazio.`);
  }
  if (!/^[A-Za-z0-9+/\r\n]*={0,2}$/.test(value)) {
    throw new HttpError(400, `O ${label} não está codificado em base64.`);
  }
  const buffer = Buffer.from(value, "base64");
  if (buffer.length === 0) {
    throw new HttpError(400, `O ${label} está vazio.`);
  }
  return buffer;
}
