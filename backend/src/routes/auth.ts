import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db";

const router = Router();

const getOwnerEmail = () => (process.env.OWNER_EMAIL || 'lokeshmandadapu96@gmail.com').toLowerCase();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const [existingUsers] = await db.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if ((existingUsers as any[]).length > 0) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const ownerEmail = getOwnerEmail();
  const role = email.toLowerCase() === ownerEmail ? 'owner' : 'customer';

  await db.execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role]
  );

  const [users] = await db.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  const user = (users as any[])[0];

  const jwtSecret = (process.env.JWT_SECRET || "secret") as jwt.Secret;
  const jwtOptions: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"],
  };
  const token = jwt.sign(
    { userId: user.id, email, role, name },
    jwtSecret,
    jwtOptions
  );

  return res.status(201).json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const [users] = await db.execute(
    "SELECT id, password_hash, role, name FROM users WHERE email = ?",
    [email]
  );

  const user = (users as any[])[0];
  if (!user) {
    return res.status(404).json({ message: "Account not found. Please register first." });
  }

  if (!(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const jwtSecret = (process.env.JWT_SECRET || "secret") as jwt.Secret;
  const jwtOptions: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"],
  };
  const token = jwt.sign(
    {
      userId: user.id,
      email,
      name: user.name,
      role: email.toLowerCase() === getOwnerEmail() ? 'owner' : user.role,
    },
    jwtSecret,
    jwtOptions
  );

  return res.json({ token });
});

router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  const [users] = await db.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  const user = (users as any[])[0];
  if (!user) {
    return res.status(404).json({ message: "Account not found. Please register first." });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.execute(
    "UPDATE users SET password_hash = ? WHERE email = ?",
    [passwordHash, email]
  );

  return res.json({ message: "Password changed successfully. Use your new password to sign in." });
});

export default router;
