import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();
router.use(authenticate);

router.get("/summary", async (req, res) => {
  const [farmerCount] = await db.execute("SELECT COUNT(*) AS total FROM farmers");
  const [collectionCount] = await db.execute("SELECT COUNT(*) AS total FROM milk_collections");
  const [paymentTotal] = await db.execute("SELECT SUM(amount) AS total FROM payments");

  res.json({
    farmers: (farmerCount as any[])[0].total,
    collections: (collectionCount as any[])[0].total,
    revenue: (paymentTotal as any[])[0].total || 0,
  });
});

export default router;
