import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/users", async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const [users] = await db.execute(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );

  res.json(users);
});

export default router;
