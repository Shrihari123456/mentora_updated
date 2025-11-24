
import express from "express";
import { verifyStudentMarks } from "../controllers/admin";
import { Router } from "express";
import { adminLogin } from "../controllers/admin";
const studRouter = Router();
// POST /api/admin/:adminId/verify-marks
// studRouter.post("/admin/:adminId/verify-marks", verifyStudentMarks);
// Add other admin routes here as needed
studRouter.post("/login", adminLogin);

export default studRouter
