import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { AppError, asyncHandler } from "./errorMiddleware.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authorization token is missing", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [decoded.id],
    );

    if (!rows[0]) {
      throw new AppError("Authenticated user no longer exists", 401);
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired authorization token", 401);
  }
});
