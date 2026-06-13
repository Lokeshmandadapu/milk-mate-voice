import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, type, title, body, created_at, is_read FROM notifications ORDER BY created_at DESC"
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { type, title, body } = req.body;
  const [result] = await db.execute(
    "INSERT INTO notifications (type, title, body) VALUES (?, ?, ?)",
    [type, title, body]
  ) as any;
  res.status(201).json({ id: result.insertId, message: "Notification created" });
});

export default router;
