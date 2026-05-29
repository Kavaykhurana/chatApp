import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { corsOptions } from "./config/cors.js";
import { errorMiddleware, notFound } from "./middleware/errorMiddleware.js";
import { initializeSocket } from "./socket/socketHandler.js";

dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use(notFound);
app.use(errorMiddleware);

initializeSocket(server);

const port = process.env.PORT || 5000;

server.listen(port);
