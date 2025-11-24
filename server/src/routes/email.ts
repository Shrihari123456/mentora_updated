// routes/email.ts
import express from "express";
import {
  sendMentorToMenteeEmail,
  sendMenteeToMentorEmail,
  getEmailHistory,
} from "../controllers/email";

const router = express.Router();

// Send email from mentor to mentee
router.post("/mentor-to-mentee", sendMentorToMenteeEmail);

// Send email from mentee to mentor
router.post("/mentee-to-mentor", sendMenteeToMentorEmail);

// Get email history
router.get("/history", getEmailHistory);

export default router;

// Add this to your main app file (app.ts or index.ts):
/*
import emailRoutes from "./routes/email";
app.use("/api/email", emailRoutes);
*/