import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM farmers ORDER BY created_at DESC");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { name, phone, location } = req.body;
  const [result] = await db.execute(
    "INSERT INTO farmers (name, phone, location) VALUES (?, ?, ?)",
    [name, phone, location]
  ) as any;

  res.status(201).json({ id: result.insertId, message: "Farmer created" });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, location } = req.body;
  await db.execute(
    "UPDATE farmers SET name = ?, phone = ?, location = ? WHERE id = ?",
    [name, phone, location, id]
  );
  res.json({ message: "Farmer updated" });
});

export default router;
