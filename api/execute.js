export default function execute(req, res) {
  console.log("=== EXECUTE ===");
  try {
    const inArguments = req.body.inArguments || [];
    res.status(200).json({
      outArguments: [{ resultado: "success" }],
    });
  } catch (error) {
    console.error("Erro em /execute:", error);
    res.status(400).json({ error: error.message });
  }
}
