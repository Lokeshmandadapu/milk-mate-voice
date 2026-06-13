import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM milk_collections ORDER BY collection_date DESC");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { farmer_id, volume_liters, fat_content, collection_date } = req.body;
  const [result] = await db.execute(
    "INSERT INTO milk_collections (farmer_id, volume_liters, fat_content, collection_date) VALUES (?, ?, ?, ?)",
    [farmer_id, volume_liters, fat_content, collection_date]
  ) as any;

  res.status(201).json({ id: result.insertId, message: "Milk collection recorded" });
});

export default router;
