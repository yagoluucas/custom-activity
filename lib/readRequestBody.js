export async function ensureRequestBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return req.body;
  }

  if (req.readableEnded || req.complete) {
    req.body = "";
    return req.body;
  }

  const chunks = [];

  try {
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  } catch (error) {
    const bodyReadError = new Error(
      `Erro ao ler o corpo bruto da requisição: ${error.message}`
    );
    bodyReadError.statusCode = 400;
    throw bodyReadError;
  }

  req.body = Buffer.concat(chunks).toString("utf8");
  return req.body;
}
