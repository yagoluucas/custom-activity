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
      req: req,
      receivedAt: new Date().toISOString(),
      contentType: req.headers?.["content-type"],
      bodyType: Buffer.isBuffer(req.body) ? "buffer" : typeof req.body,
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
