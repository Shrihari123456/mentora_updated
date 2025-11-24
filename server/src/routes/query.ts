import express from 'express';
import { processTextQuery } from '../controllers/query';

const router = express.Router();

router.post('/find', processTextQuery);

export default router;