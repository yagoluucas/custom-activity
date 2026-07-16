// api/execute.js

import { createClient } from "redis";
import {
  parseSalesforceJwtRequest,
  sendLoggedError,
  sendLoggedResponse,
} from "../lib/salesforceRequest.js";
import { ensureRequestBody } from "../lib/readRequestBody.js";

let redis;

async function getRedis() {
  try {
    if (!redis) {
      redis = createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 2000 },
      });
      await redis.connect();
    } else if (!redis.isOpen) {
      await redis.connect();
    }

    return redis;
  } catch (error) {
    throw new Error("Erro ao se conectar com Redis: " + error);
  }
}

const tokenExpiredMargin = 60 * 1000;

async function getInfoFromCache() {
  try {
    const client = await getRedis();
    const token = await client.get("token");
    const expired = await client.get("expire");
    return { token, expiredDate: expired ? Number(expired) : null };
  } catch (error) {
    console.error("Erro ao recuperar informações do cache:", error);
    throw new Error("Erro ao recuperar informações do cache: " + error);
  }
}

async function setInfoFromCache(token, expire) {
  const tokenExpireDate = Date.now() + expire * 1000;

  try {
    const client = await getRedis();
    await client.set("token", token);
    await client.set("expire", tokenExpireDate.toString());
  } catch (error) {
    console.error("Erro ao salvar informações no cache:", error);
    throw new Error("Erro ao salvar informações no cache: " + error);
  }
}

async function fetchNewTokenFromApi() {
  const url = process.env.bearer_token_url;
  const clienteId = process.env.client_id;
  const clienteSecret = process.env.client_secret;

  const payloadReq = {
    grant_type: "client_credentials",
    client_id: clienteId,
    client_secret: clienteSecret,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadReq),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("Falha ao obter bearer token", {
      status: response.status,
      responseBody,
    });
    throw new Error(`Erro ao obter bearer token: ${response.status}`);
  }

  const data = await response.json();
  return { newToken: data.access_token, expires: data.expires_in };
}

async function getNewToken() {
  const { newToken, expires } = await fetchNewTokenFromApi();
  await setInfoFromCache(newToken, expires);
  return newToken;
}

async function catchBearerToken() {
  const { token, expiredDate } = await getInfoFromCache();

  if (
    token &&
    expiredDate &&
    token !== "" &&
    Date.now() + tokenExpiredMargin < expiredDate
  ) {
    return token;
  }

  return getNewToken();
}

async function insertDe(inArguments, bearerToken) {
  const keyDataExtension = inArguments.find(
    (arg) => arg.idDataExtension
  )?.idDataExtension;
  const contactKey = inArguments.find((arg) => arg.contactKey)?.contactKey;
  const campaignName = inArguments.find(
    (arg) => arg.nomeCampanha
  )?.nomeCampanha;
  const emailUser = inArguments.find((arg) => arg.email)?.email;

  const url = `${process.env.insert_de_url}${keyDataExtension}/rows`;
  const payload = {
    items: [
      {
        UserKey: contactKey,
        email: emailUser,
        dateInsertion: new Date().toISOString(),
        campaignName,
      },
    ],
  };

  console.log("[SFMC][EXECUTE][DE_REQUEST]", {
    url,
    payload,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let responseBody = responseText;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    // Mantém o conteúdo textual para diagnóstico.
  }

  console.log("[SFMC][EXECUTE][DE_RESPONSE]", {
    status: response.status,
    ok: response.ok,
    responseBody,
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao inserir dados na DE: ${response.status} ${responseText}`
    );
  }

  return responseBody;
}

export default async function execute(req, res) {
  const endpoint = "execute";
  let context;

  try {
    await ensureRequestBody(req);
    context = parseSalesforceJwtRequest(req, endpoint);

    const inArguments = context.payload?.inArguments;

    if (!Array.isArray(inArguments)) {
      const validationError = new Error("inArguments não fornecido no JWT");
      validationError.statusCode = 400;
      throw validationError;
    }

    const bearerToken = await catchBearerToken();
    const resultadoInsercao = await insertDe(inArguments, bearerToken);

    return sendLoggedResponse(res, context, 200, {
      outArguments: [
        {
          returnValue: "Dados inseridos com sucesso!",
        },
      ],
      result: resultadoInsercao,
    });
  } catch (error) {
    return sendLoggedError(res, endpoint, error, context);
  }
}
