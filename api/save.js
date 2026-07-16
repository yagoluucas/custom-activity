import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";

export default function saveActivity(req, res) {
  const endpoint = "save";
  let context;

  try {
    console.log(`Requisição: ${req}`);
    context = parseSalesforceJwtRequest(req, endpoint);

    return sendLoggedResponse(res, context, 200, {
      status: "Activity saved successfully",
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
