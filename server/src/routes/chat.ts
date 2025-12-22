// routes/chatRoutes.ts
import express from 'express';
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  getMentorStudents,
  getStudentChatInfo,
  getMentorChats
} from '../controllers/chat';

const router = express.Router();

// Get chat messages
router.get('/messages', getChatMessages);

// Send message
router.post('/send', sendChatMessage);

// Mark messages as read
router.post('/read', markMessagesAsRead);

// Get all students for a mentor
router.get('/mentor/:empId/students', getMentorStudents);

// Get mentor's all chats
router.get('/mentor/:empId/chats', getMentorChats);

// Get student's chat info (with mentor details)
router.get('/student/:srNo/info', getStudentChatInfo);

export default router;