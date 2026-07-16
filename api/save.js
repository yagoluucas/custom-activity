import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";

export default function saveActivity(req, res) {
  const endpoint = "save";
  let context;

  try {
    console.log("[SFMC][SAVE][RAW_BODY]", {
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
