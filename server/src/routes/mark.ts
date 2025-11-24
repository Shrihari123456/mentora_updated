import express from 'express';
import { bulkUploadMarks, getMarksByUsn } from '../controllers/markcontroller';


const markrouter = express.Router();

markrouter.post('/bulk',bulkUploadMarks);
markrouter.get('/markbyusn', getMarksByUsn);

export default markrouter;