import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";
import { ensureRequestBody } from "../lib/readRequestBody.js";

export default async function publish(req, res) {
  const endpoint = "publish";
  let context;

  try {
    await ensureRequestBody(req);
    context = parseSalesforceJwtRequest(req, endpoint);

    return sendLoggedResponse(res, context, 200, {
      status: "Activity published successfully",
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
