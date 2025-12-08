export default function publish(req, res) {
    console.log("=== PUBLISH ===");
    try {
        res.status(200).json({ status: "Activity published successfully" });
    } catch (error) {
        console.error("Error in /publish:", error);
        res.status(400).json({ error: error.message });
    }
}
