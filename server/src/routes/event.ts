import express from 'express';
import { getEvents } from '../controllers/event';

const router = express.Router();

// Real-time endpoint
router.get('/realtime', getEvents);

export default router;