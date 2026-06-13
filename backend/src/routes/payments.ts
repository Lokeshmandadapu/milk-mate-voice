import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM payments ORDER BY paid_at DESC");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { farmer_id, amount, method, paid_at } = req.body;
  const [result] = await db.execute(
    "INSERT INTO payments (farmer_id, amount, method, paid_at) VALUES (?, ?, ?, ?)",
    [farmer_id, amount, method, paid_at]
  ) as any;

  res.status(201).json({ id: result.insertId, message: "Payment recorded" });
});

export default router;
