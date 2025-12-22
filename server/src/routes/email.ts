// routes/emailRoutes.ts
import express from "express";
import {
  sendEmail,
  getInbox,
  getSentEmails,
  getStarredEmails,
  getEmail,
  markAsRead,
  toggleStar,
  updateLabels,
  deleteEmail,
  getTrash,
  emptyTrash,
  getMentorInfo,
  getMentorStudents,
  getEmailStats,
  getEmailThread
} from "../controllers/email";

const router = express.Router();

// Send email
router.post("/send", sendEmail);

// Get inbox emails
router.get("/inbox/:userId/:userType", getInbox);

// Get sent emails
router.get("/sent/:userId/:userType", getSentEmails);

// Get starred emails
router.get("/starred/:userId/:userType", getStarredEmails);

// Get trash emails
router.get("/trash/:userId/:userType", getTrash);

// Empty trash
router.delete("/trash/:userId/:userType", emptyTrash);

// Get email thread
router.get("/thread/:threadId", getEmailThread);

// ===== SPECIFIC ROUTES MUST COME BEFORE PARAMETER ROUTES =====
// Get mentor's students - THIS MUST COME BEFORE /:emailId
router.get("/mentor-students/:mentorEmpId", getMentorStudents);

// Get mentor info for student
router.get("/student-mentor/:studentSrNo", getMentorInfo);

// Get email statistics
router.get("/stats/:userId/:userType", getEmailStats);

// ===== PARAMETER ROUTES (GENERIC) COME LAST =====
// Get single email - THIS COMES AFTER ALL SPECIFIC ROUTES
router.get("/:emailId", getEmail);

// Mark as read/unread
router.patch("/:emailId/read", markAsRead);

// Toggle star
router.patch("/:emailId/star", toggleStar);

// Update labels
router.patch("/:emailId/labels", updateLabels);

// Delete email
router.delete("/:emailId", deleteEmail);

export default router;