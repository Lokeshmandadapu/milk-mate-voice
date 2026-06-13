import dotenv from "dotenv";

// Load environment variables FIRST, before importing any modules that need them
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import farmerRoutes from "./routes/farmers";
import milkCollectionRoutes from "./routes/milkCollection";
import paymentRoutes from "./routes/payments";
import analyticsRoutes from "./routes/analytics";
import reportRoutes from "./routes/reports";
import notificationRoutes from "./routes/notifications";
import adminRoutes from "./routes/admin";
import aiRoutes from "./routes/ai";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/milk-collection", milkCollectionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

app.listen(port, () => {
  console.log(`Milk Mate Pro backend listening on http://localhost:${port}`);
});
