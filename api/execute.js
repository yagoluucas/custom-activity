function catchBearerToken(){
  return process.env.bearer_token_url;
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
