// api/execute.js

import { createClient } from "redis";

let redis;

async function getRedis() {
  try {
    if (!redis) {
      redis = createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 2000 }, // garantir timeout abaixo de 10s
      });
      await redis.connect();
    } else if (!redis.isOpen) {
      // Garantir que o client está aberto
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
    console.log("Erro ao recuperar informações do cache: " + error);
    throw new Error("Erro ao recuperar informações do cache: " + error);
  }
}

async function setInfoFromCache(token, expire) {
  const date = Date.now();
  const tokenExpireDate = date + expire * 1000;
  try {
    const client = await getRedis();
    await client.set("token", token);
    await client.set("expire", tokenExpireDate.toString());
  } catch (error) {
    console.log("Erro ao salvar informações no cache:  " + error);
    throw new Error("Erro ao salvar informações no cache:  " + error);
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadReq),
    });

    if (!response.ok) {
      console.log("Response status:", response.status);
      console.log("Response body:", await response.text());
      throw new Error(`Erro ao obter bearer token: ${response.status}`);
    }

    const data = await response.json();

    return { newToken: data.access_token, expires: data.expires_in };
  } catch (error) {
    throw error;
  }
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

  const newToken = await getNewToken();
  return newToken;
}

async function insertDe(inArguments, bearerToken) {
  const keyDataExtension = inArguments.find(
    (arg) => arg.idDataExtension
  )?.idDataExtension;
  const contactKey = inArguments.find((arg) => arg.contactKey)?.contactKey;
  const campaignName = inArguments.find(
    (arg) => arg.nomeCampanha
  )?.nomeCampanha;

  const url = `${process.env.insert_de_url}${keyDataExtension}/rows`;

  const payload = {
    items: [
      {
        UserKey: contactKey,
        email: contactKey,
        dateInsertion: new Date().toLocaleString(),
        campaignName: campaignName,
      },
    ],
  };

  console.log("Payload para inserção na DE: ", payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `BEARER ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro ao inserir dados na DE: ${response.body}`);
    }

    const data = await response.json();
    console.log("Dados inseridos na DE: ", data);

    return data;
  } catch (error) {
    console.error("Erro em insertDe:", error);
    throw error;
  }
}

export default async function execute(req, res) {
  console.log("=== EXECUTE ===");

  try {
    const inArgs = req.body.inArguments;

    if (!inArgs) {
      return res.status(400).json({
        error: "inArguments não fornecido",
      });
    }

    // Passo 1: Obter o bearer token
    const bearerToken = await catchBearerToken();

    // Passo 2: Inserir dados na DE
    const resultadoInsercao = await insertDe(inArgs, bearerToken);

    // Passo 3: Retornar sucesso
    res.status(200).json([
      {
      returnValue: resultadoInsercao,
    }
    ]);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Erro interno do servidor",
    });
  }
}
