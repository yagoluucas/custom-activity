import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";

export default function publish(req, res) {
  const endpoint = "publish";
  let context;

  try {
    context = parseSalesforceJwtRequest(req, endpoint);

    return sendLoggedResponse(res, context, 200, {
      status: "Activity published successfully",
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
