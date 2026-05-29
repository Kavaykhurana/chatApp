import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { AppError, asyncHandler } from "../middleware/errorMiddleware.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const validateAuthInput = ({ name, email, password }, isRegister = false) => {
  if (isRegister && !name?.trim()) {
    throw new AppError("Name is required", 400);
  }

  if (!email?.trim()) {
    throw new AppError("Email is required", 400);
  }

  if (!emailPattern.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!password) {
    throw new AppError("Password is required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  validateAuthInput({ name, email, password }, true);

  const existingUser = await query("SELECT id FROM users WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);

  if (existingUser.rows[0]) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { rows } = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name.trim(), email.toLowerCase().trim(), hashedPassword],
  );

  const user = sanitizeUser(rows[0]);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token: createToken(user.id),
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateAuthInput({ email, password }, false);

  const { rows } = await query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);
  const user = rows[0];

  if (!user) {
    throw new AppError("No account found with this email", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Incorrect password", 401);
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: createToken(user.id),
    user: sanitizeUser(user),
  });
});
