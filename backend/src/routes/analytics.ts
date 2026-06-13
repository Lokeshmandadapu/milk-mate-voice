import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/milk-volume", async (req, res) => {
  const [rows] = await db.execute(
    `SELECT collection_date AS date, SUM(volume_liters) AS total_volume
     FROM milk_collections
     GROUP BY collection_date
     ORDER BY collection_date ASC`
  );
  res.json(rows);
});

router.get("/payments", async (req, res) => {
  const [rows] = await db.execute(
    `SELECT paid_at AS date, SUM(amount) AS total_amount
     FROM payments
     GROUP BY paid_at
     ORDER BY paid_at ASC`
  );
  res.json(rows);
});

export default router;
