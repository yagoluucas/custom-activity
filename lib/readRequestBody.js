export async function ensureRequestBody(req) {
  const existingBody = req.body;
  const hasExistingBody =
    existingBody !== undefined &&
    existingBody !== null &&
    !(typeof existingBody === "string" && existingBody.trim() === "");

  if (hasExistingBody) {
    return existingBody;
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
