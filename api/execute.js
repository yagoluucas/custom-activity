function catchBearerToken() {
  const url = process.env.bearerTokenUrl;
  const clienteId = process.env.clienteId;
  const clienteSecret = process.env.clienteSecret;

  const payloadReq = {
    grant_type: "client_credentials",
    client_id: clienteId,
    client_secret: clienteSecret,
  };

  fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payloadReq)
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return error;
    });
}

export default function execute(req, res) {
  console.log("=== EXECUTE ===");
  try {
    const inArgs = req.body.inArguments[0];
    const bearerTokenUrl = catchBearerToken();
    res.status(200).json({
      outArguments: [{ resultado: bearerTokenUrl }],
    });
  } catch (error) {
    console.error("Erro em /execute:", error);
    res.status(400).json({ error: error.message });
  }
}
