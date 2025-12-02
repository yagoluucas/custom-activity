export default function stop(req, res) {
    console.log("===  VALIDATE ===");
    try {
        const inArgs = req.body.inArguments[0];
        console.log("inArguments:", inArgs);
        res.status(200).json({ status: "Activity stopped successfully" });
    } catch (error) {
        console.error("Error in /stop:", error);
        res.status(400).json({ error: error.message });
    }
}