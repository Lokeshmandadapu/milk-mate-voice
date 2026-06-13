import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.use(authenticate);

router.post("/assistant", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  // Placeholder for AI assistant integration. Connect to a real AI service here.
  res.json({
    prompt,
    reply: "This is a placeholder response from the Milk Mate Pro AI assistant.",
  });
});

export default router;
