export default function execute(req, res) {
  console.log("=== EXECUTE ===");
  try {
    if(req.body && req.body.inArguments && req.body.inArguments.length > 0) {
      const inArgs = req.body.inArguments[0];
      console.log("inArguments:", inArgs);
    }
    res.status(200).json({
      outArguments: [{ resultado: "success" }],
    });
  } catch (error) {
    console.error("Erro em /execute:", error);
    res.status(400).json({ error: error.message });
  }
}
