import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";
import { ensureRequestBody } from "../lib/readRequestBody.js";

export default async function validate(req, res) {
  const endpoint = "validate";
  let context;

  try {
    await ensureRequestBody(req);
    context = parseSalesforceJwtRequest(req, endpoint);

    return sendLoggedResponse(res, context, 200, {
      status: "Activity validated successfully",
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
