import express from 'express';
import {
  createVerificationRequest,
  getStudentVerificationRequests,
  getVerificationRequestById,
  processVerificationRequest,
  getVerificationStats,
  getVerificationRequestsFromMarks
} from '../controllers/verification';

const router = express.Router();

// Static routes first
router.get('/from-marks', getVerificationRequestsFromMarks);
router.post('/request', createVerificationRequest);
router.get('/student/:usn', getStudentVerificationRequests);
router.get('/stats', getVerificationStats);

// Dynamic routes last
// routes/verification.ts
router.patch('/:requestId', processVerificationRequest);

router.get('/:requestId', getVerificationRequestById);
// router.patch('/:requestId/process', processVerificationRequest);

export default router;