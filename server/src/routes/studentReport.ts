import express from 'express';
import { studentSearch } from '../controllers/studentReport';

const router = express.Router();

// AI-powered student search
router.post('/search', studentSearch);

export default router;