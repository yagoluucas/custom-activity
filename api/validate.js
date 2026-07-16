import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";

export default function validate(req, res) {
  const endpoint = "validate";
  let context;

  try {
    context = parseSalesforceJwtRequest(req, endpoint);

    return sendLoggedResponse(res, context, 200, {
      status: "Activity validated successfully",
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
