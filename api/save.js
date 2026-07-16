import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";
import { ensureRequestBody } from "../lib/readRequestBody.js";

export default async function saveActivity(req, res) {
  const endpoint = "save";
  let context;

  try {
    await ensureRequestBody(req);

    console.log("[SFMC][SAVE][RAW_BODY]", {
      receivedAt: new Date().toISOString(),
      contentType: req.headers?.["content-type"],
      contentLength: req.headers?.["content-length"],
      bodyType: Buffer.isBuffer(req.body) ? "buffer" : typeof req.body,
      bodyLength:
        typeof req.body === "string" || Buffer.isBuffer(req.body)
          ? req.body.length
          : undefined,
      body: req.body,
    });

    context = parseSalesforceJwtRequest(req, endpoint);

    return sendLoggedResponse(res, context, 200, {
      status: "Activity saved successfully",
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
