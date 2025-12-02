// api/execute.js

async function catchBearerToken() {
  const url = process.env.bearer_token_url;
  const clienteId = process.env.client_id;
  const clienteSecret = process.env.client_secret;

  const payloadReq = {
    grant_type: "client_credentials",
    client_id: clienteId,
    client_secret: clienteSecret
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
      console.log('Response status:', response.status);
      console.log('Response body:', await response.text());
      throw new Error(`Erro ao obter bearer token: ${response.status}`);
    }

    const data = await response.json();

    return data.access_token; // Retorna apenas o token
  } catch (error) {
    throw error;
  }
}

async function insertDe(inArguments, bearerToken, keyDaDe) {
  const url = `${process.env.insert_de_url}${keyDaDe}/rows`;
  
  const payload = {
    items: [
      {
        UserKey: inArguments.contactKey || "testandouma",
        email: inArguments.email || "yago.silva@pmweb.com",
      },
    ],
  };

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
    console.log("Dados inseridos na DE:", data);
    
    return data;
  } catch (error) {
    console.error("Erro em insertDe:", error);
    throw error;
  }
}

export default async function execute(req, res) {
  console.log("=== EXECUTE ===");
  
  try {
    const inArgs = req.body.inArguments?.[0];
    console.log("inArguments recebidos:", inArgs);

    if (!inArgs) {
      return res.status(400).json({ 
        error: "inArguments não fornecido" 
      });
    }

    // Passo 1: Obter o bearer token
    const bearerToken = await catchBearerToken();

    // Passo 2: Inserir dados na DE
    const keyDaDe = "75D1EDF7-3712-4582-AF65-CF01A92A9F67"
    const resultadoInsercao = await insertDe(inArgs, bearerToken, keyDaDe);

    // Passo 3: Retornar sucesso
    res.status(200).json({
      outArguments: [{ 
        resultado: "success",
        message: "Dados inseridos na DE com sucesso",
        data: resultadoInsercao
      }],
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || "Erro interno do servidor"
    });
  }
}