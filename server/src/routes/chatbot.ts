import express from 'express';
import { sendMessage, getQuickPrompts, uploadPDF, upload } from '../controllers/chatbot';

const router = express.Router();

// Chatbot routes
router.post('/send', sendMessage);
router.post('/upload', upload.single('pdf'), uploadPDF);
router.get('/prompts', getQuickPrompts);

export default router;