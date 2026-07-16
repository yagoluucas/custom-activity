import { createHmac, timingSafeEqual } from "node:crypto";

const REDACTED_VALUE = "[REDACTED]";

class JwtRequestError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = "JwtRequestError";
    this.statusCode = statusCode;
  }
}

function isSensitiveKey(key) {
  const normalizedKey = String(key).toLowerCase().replace(/[-_]/g, "");

  return [
    "authorization",
    "cookie",
    "setcookie",
    "clientsecret",
    "password",
    "secret",
    "accesstoken",
    "refreshtoken",
  ].includes(normalizedKey);
}

function sanitizeForLog(value, key = "", seen = new WeakSet()) {
  if (isSensitiveKey(key)) {
    return REDACTED_VALUE;
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item, "", seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[CIRCULAR]";
    }

    seen.add(value);

    const sanitizedObject = Object.fromEntries(
      Object.entries(value).map(([objectKey, objectValue]) => [
        objectKey,
        sanitizeForLog(objectValue, objectKey, seen),
      ])
    );

    seen.delete(value);
    return sanitizedObject;
  }

  return value;
}

function writeLog(level, endpoint, event, details) {
  const logger = console[level] || console.log;
  logger(
    `[SFMC][${endpoint.toUpperCase()}][${event}]`,
    JSON.stringify(sanitizeForLog(details), null, 2)
  );
}

function looksLikeJwt(value) {
  return typeof value === "string" && value.split(".").length === 3;
}

function extractJwtToken(body) {
  if (Buffer.isBuffer(body)) {
    return extractJwtToken(body.toString("utf8"));
  }

  if (typeof body === "string") {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      throw new JwtRequestError("JWT não fornecido no corpo da requisição");
    }

    if (trimmedBody.startsWith('"') && trimmedBody.endsWith('"')) {
      try {
        const parsedBody = JSON.parse(trimmedBody);
        if (typeof parsedBody === "string") {
          return parsedBody.trim();
        }
      } catch {
        // Continua com o corpo original para retornar um erro de JWT mais claro.
      }
    }

    return trimmedBody;
  }

  if (body && typeof body === "object") {
    const tokenFromKnownProperty =
      body.jwt || body.token || body.encodedJWT || body.encodedJwt;

    if (typeof tokenFromKnownProperty === "string") {
      return tokenFromKnownProperty.trim();
    }

    const entries = Object.entries(body);
    if (entries.length === 1) {
      const [possibleToken, possibleValue] = entries[0];

      if (looksLikeJwt(possibleToken) && !possibleValue) {
        return possibleToken;
      }

      if (looksLikeJwt(possibleValue)) {
        return possibleValue;
      }
    }
  }

  throw new JwtRequestError(
    "Formato inválido: o endpoint aceita somente requisições JWT da Salesforce"
  );
}

function decodeJwtSegment(segment, segmentName) {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    throw new JwtRequestError(`JWT com ${segmentName} inválido`);
  }
}

function getJwtSigningSecret() {
  const signingSecret = process.env.JWT_SIGNING_SECRET;

  if (!signingSecret) {
    throw new JwtRequestError(
      "JWT_SIGNING_SECRET não está configurado no ambiente",
      500
    );
  }

  return signingSecret;
}

function verifySalesforceJwt(token) {
  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    throw new JwtRequestError("JWT malformado");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
  const header = decodeJwtSegment(encodedHeader, "header");

  if (header.alg !== "HS256") {
    throw new JwtRequestError(
      `Algoritmo JWT não suportado: ${header.alg || "não informado"}`
    );
  }

  const expectedSignature = createHmac("sha256", getJwtSigningSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const receivedSignature = Buffer.from(encodedSignature, "base64url");

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    throw new JwtRequestError("Assinatura JWT inválida");
  }

  const payload = decodeJwtSegment(encodedPayload, "payload");
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload.exp && nowInSeconds >= Number(payload.exp)) {
    throw new JwtRequestError("JWT expirado");
  }

  if (payload.nbf && nowInSeconds < Number(payload.nbf)) {
    throw new JwtRequestError("JWT ainda não está válido");
  }

  return { header, payload };
}

function describeRawBody(body) {
  if (Buffer.isBuffer(body)) {
    return {
      type: "buffer",
      length: body.length,
    };
  }

  if (typeof body === "string") {
    return {
      type: "string",
      length: body.length,
      looksLikeJwt: looksLikeJwt(body.trim()),
    };
  }

  if (body && typeof body === "object") {
    return {
      type: "object",
      keys: Object.keys(body),
    };
  }

  return {
    type: typeof body,
  };
}

export function parseSalesforceJwtRequest(req, endpoint) {
  const startedAt = Date.now();
  const receivedAt = new Date().toISOString();

  try {
    const token = extractJwtToken(req.body);
    const { header, payload } = verifySalesforceJwt(token);

    const context = {
      endpoint,
      startedAt,
      receivedAt,
      payload,
    };

    writeLog("log", endpoint, "REQUEST", {
      endpoint,
      receivedAt,
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      rawBody: describeRawBody(req.body),
      jwt: {
        algorithm: header.alg,
        type: header.typ,
        length: token.length,
      },
      salesforcePayload: payload,
    });

    return context;
  } catch (error) {
    error.requestStartedAt = startedAt;

    writeLog("error", endpoint, "REQUEST_REJECTED", {
      endpoint,
      receivedAt,
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      rawBody: describeRawBody(req.body),
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode || 500,
      },
    });

    throw error;
  }
}

export function sendLoggedResponse(res, context, statusCode, responseBody) {
  const respondedAt = new Date().toISOString();

  writeLog("log", context.endpoint, "RESPONSE", {
    endpoint: context.endpoint,
    receivedAt: context.receivedAt,
    respondedAt,
    durationMs: Date.now() - context.startedAt,
    statusCode,
    responseBody,
  });

  return res.status(statusCode).json(responseBody);
}

export function sendLoggedError(res, endpoint, error, context) {
  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;
  const responseBody = {
    error:
      statusCode >= 500
        ? "Erro interno do servidor"
        : error.message || "Requisição inválida",
  };
  const startedAt = context?.startedAt || error.requestStartedAt || Date.now();

  writeLog("error", endpoint, "ERROR_RESPONSE", {
    endpoint,
    receivedAt: context?.receivedAt,
    respondedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    statusCode,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    responseBody,
  });

  return res.status(statusCode).json(responseBody);
}
