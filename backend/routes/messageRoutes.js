import express from "express";
import {
  getChatHistory,
  getUsers,
  markMessagesRead,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/users", getUsers);
router.get("/:userId", getChatHistory);
router.post("/send/:receiverId", sendMessage);
router.patch("/read/:userId", markMessagesRead);

export default router;
