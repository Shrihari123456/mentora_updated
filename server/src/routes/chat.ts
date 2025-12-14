import express from "express";
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  clearChat
} from "../controllers/chat";

const router = express.Router();

// SIMPLE CHAT ROUTES WITH HARDCODED VALUES
router.get("/messages", getChatMessages);
router.post("/send", sendChatMessage);
router.put("/read", markMessagesAsRead);
router.delete("/clear", clearChat); // Optional for testing

export default router;