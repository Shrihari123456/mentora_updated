import express from 'express';
import {
  startMeeting,
  endMeeting
} from '../controllers/appointment';

const router = express.Router();

// Meeting routes
router.post('/:id/start', startMeeting);
router.post('/:id/end', endMeeting);

export default router;