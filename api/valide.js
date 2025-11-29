export function validate(req, res) {
    console.log("=== VALIDATE ===");
    try {
        const inArgs = req.body.inArguments[0];
        console.log("inArguments:", inArgs);
        res.status(200).json({ status: "Validation successful" });
    } catch (error) {
        console.error("Error in /validate:", error);
        res.status(400).json({ error: error.message });
    }
}