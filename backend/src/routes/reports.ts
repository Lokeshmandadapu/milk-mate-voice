import { Router, Request, Response } from "express";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import db from "../db";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication middleware to all routes except download
router.use((req, res, next) => {
  if (req.path.startsWith("/download/")) {
    return next();
  }
  authenticate(req as any, res, next);
});

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    name: string;
  };
}

const REPORTS_DIR = path.join(__dirname, "../../reports");

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Save sales records to database
router.post("/save-sales", async (req: AuthRequest, res: Response) => {
  try {
    const { sales } = req.body;
    
    if (!Array.isArray(sales)) {
      return res.status(400).json({ message: "Sales data must be an array" });
    }

    for (const sale of sales) {
      await db.execute(
        `INSERT IGNORE INTO sales_records (customer_name, liters, amount, timestamp) 
         VALUES (?, ?, ?, ?)`,
        [sale.customerName, sale.liters, sale.amount, new Date(sale.timestamp).toISOString().slice(0, 19).replace('T', ' ')]
      );
    }

    return res.json({ message: "Sales records saved successfully" });
  } catch (error) {
    console.error("Error saving sales records:", error);
    return res.status(500).json({ message: "Failed to save sales records" });
  }
});

// Save payment records to database
router.post("/save-payments", async (req: AuthRequest, res: Response) => {
  try {
    const { payments } = req.body;
    
    if (!Array.isArray(payments)) {
      return res.status(400).json({ message: "Payments data must be an array" });
    }

    for (const payment of payments) {
      await db.execute(
        `INSERT IGNORE INTO payment_records (customer_name, amount, timestamp) 
         VALUES (?, ?, ?)`,
        [payment.customerName, payment.amount, new Date(payment.timestamp).toISOString().slice(0, 19).replace('T', ' ')]
      );
    }

    return res.json({ message: "Payment records saved successfully" });
  } catch (error) {
    console.error("Error saving payment records:", error);
    return res.status(500).json({ message: "Failed to save payment records" });
  }
});

// Get records for a specific month
router.get("/records/:year/:month/:customerName", async (req: AuthRequest, res: Response) => {
  try {
    const { year, month, customerName } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (!monthNum || !yearNum || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    // For customers, only allow viewing their own records
    if (req.user?.role === "customer" && req.user?.name !== customerName) {
      return res.status(403).json({ message: "Access denied" });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Get sales records
    const [salesRecords] = await db.execute(
      `SELECT id, customer_name, liters, amount, timestamp 
       FROM sales_records 
       WHERE customer_name = ? 
       AND DATE(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp DESC`,
      [customerName, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]
    );

    // Get payment records
    const [paymentRecords] = await db.execute(
      `SELECT id, customer_name, amount, timestamp 
       FROM payment_records 
       WHERE customer_name = ? 
       AND DATE(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp DESC`,
      [customerName, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]
    );

    const sales = (salesRecords as any[]).map((record: any) => ({
      id: record.id,
      customerName: record.customer_name,
      liters: record.liters,
      amount: record.amount,
      timestamp: record.timestamp,
      type: "sale",
    }));

    const payments = (paymentRecords as any[]).map((record: any) => ({
      id: record.id,
      customerName: record.customer_name,
      amount: record.amount,
      timestamp: record.timestamp,
      type: "payment",
    }));

    return res.json({
      month: monthNum,
      year: yearNum,
      customerName,
      sales,
      payments,
    });
  } catch (error) {
    console.error("Error fetching monthly records:", error);
    return res.status(500).json({ message: "Failed to fetch records" });
  }
});

// Generate Excel file for a customer's monthly records
router.post("/generate-excel/:year/:month/:customerName", async (req: AuthRequest, res: Response) => {
  try {
    const { year, month, customerName } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (!monthNum || !yearNum || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    // For customers, only allow generating their own reports
    if (req.user?.role === "customer" && req.user?.name !== customerName) {
      return res.status(403).json({ message: "Access denied" });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Get sales and payments
    const [salesRecords] = await db.execute(
      `SELECT id, customer_name, liters, amount, timestamp 
       FROM sales_records 
       WHERE customer_name = ? 
       AND DATE(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [customerName, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]
    );

    const [paymentRecords] = await db.execute(
      `SELECT id, customer_name, amount, timestamp 
       FROM payment_records 
       WHERE customer_name = ? 
       AND DATE(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [customerName, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]
    );

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Record");

    // Set column widths
    worksheet.columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Time", key: "time", width: 12 },
      { header: "Type", key: "type", width: 10 },
      { header: "Liters", key: "liters", width: 10 },
      { header: "Amount (₹)", key: "amount", width: 12 },
    ];

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };

    // Add data
    let rowNumber = 2;
    let totalLiters = 0;
    let totalAmount = 0;
    let totalPayments = 0;

    // Add sales
    (salesRecords as any[]).forEach((record: any) => {
      const date = new Date(record.timestamp);
      worksheet.getRow(rowNumber).values = {
        date: date.toLocaleDateString("en-IN"),
        time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: "Sale",
        liters: record.liters,
        amount: record.amount,
      };
      totalLiters += record.liters;
      totalAmount += record.amount;
      rowNumber++;
    });

    // Add payments
    (paymentRecords as any[]).forEach((record: any) => {
      const date = new Date(record.timestamp);
      worksheet.getRow(rowNumber).values = {
        date: date.toLocaleDateString("en-IN"),
        time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: "Payment",
        liters: "-",
        amount: `-${record.amount}`,
      };
      totalPayments += record.amount;
      rowNumber++;
    });

    // Add summary
    rowNumber++;
    const summaryRow = worksheet.getRow(rowNumber);
    summaryRow.font = { bold: true };
    summaryRow.values = {
      date: "SUMMARY",
      liters: totalLiters,
      amount: totalAmount - totalPayments,
    };

    // Save file
    const monthName = new Date(yearNum, monthNum - 1).toLocaleString("en-IN", { month: "long" });
    const fileName = `${customerName}_${monthName}_${yearNum}.xlsx`;
    const filePath = path.join(REPORTS_DIR, fileName);

    await workbook.xlsx.writeFile(filePath);

    // Save record in database
    await db.execute(
      `INSERT INTO monthly_reports (customer_name, year, month, file_name, created_at) 
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE file_name = ?, created_at = NOW()`,
      [customerName, yearNum, monthNum, fileName, fileName]
    );

    return res.json({
      message: "Excel file generated successfully",
      fileName,
      downloadUrl: `/api/reports/download/${fileName}`,
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return res.status(500).json({ message: "Failed to generate Excel file" });
  }
});

// List monthly reports for a customer
router.get("/list/:customerName", async (req: AuthRequest, res: Response) => {
  try {
    const { customerName } = req.params;

    // For customers, only allow viewing their own reports
    if (req.user?.role === "customer" && req.user?.name !== customerName) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [reports] = await db.execute(
      `SELECT file_name, year, month, created_at 
       FROM monthly_reports 
       WHERE customer_name = ? 
       ORDER BY year DESC, month DESC`,
      [customerName]
    );

    return res.json({ reports });
  } catch (error) {
    console.error("Error listing reports:", error);
    return res.status(500).json({ message: "Failed to list reports" });
  }
});

// Download Excel file
router.get("/download/:fileName", (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    // Sanitize filename to prevent path traversal
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return res.status(400).json({ message: "Invalid file name" });
    }

    const filePath = path.join(REPORTS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath);
  } catch (error) {
    console.error("Error downloading file:", error);
    return res.status(500).json({ message: "Failed to download file" });
  }
});

export default router;
