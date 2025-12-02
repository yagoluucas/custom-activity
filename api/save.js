export default function saveActivity(req, res) {
    console.log("=== SAVE ACTIVITY ===");
    try {
        res.status(200).json({ status: "Activity saved successfully" });
    } catch (error) {
        console.error("Error in /saveActivity:", error);
        res.status(400).json({ error: error.message });
    }
}