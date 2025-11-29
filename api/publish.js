export default function publish(req, res) {
    console.log("=== PUBLISH ===");
    try {
        const inArgs = req.body.inArguments[0];
        console.log("inArguments:", inArgs);
        res.status(200).json({ status: "Activity published successfully" });
    } catch (error) {
        console.error("Error in /publish:", error);
        res.status(400).json({ error: error.message });
    }
}
