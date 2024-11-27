import { Router } from "express";
import {
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  getMentorByEmpId,
  addStudent,
  getStudents,
  loginMentor,
  updatePassword,
} from "../controllers/mentor";

const router = Router();

/**
 * @swagger
 * /mentors:
 *   get:
 *     summary: Retrieve a list of mentors
 *     responses:
 *       200:
 *         description: A list of mentors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mentor'
 */
router.get("/mentors", getMentors);

/**
 * @swagger
 * /mentors/{id}:
 *   get:
 *     summary: Retrieve a single mentor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     responses:
 *       200:
 *         description: A single mentor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mentor'
 *       404:
 *         description: Mentor not found
 */
router.get("/mentors/:id", getMentorById);

//fetch by empId

router.get("/mentors/empId/:empId", getMentorByEmpId);

/**
 * @swagger
 * /mentors:
 *   post:
 *     summary: Create a new mentor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mentor'
 *     responses:
 *       201:
 *         description: The created mentor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mentor'
 *       400:
 *         description: Bad request
 */
router.post("/mentors", createMentor);

/**
 * @swagger
 * /mentors/{id}:
 *   put:
 *     summary: Update a mentor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mentor'
 *     responses:
 *       200:
 *         description: The updated mentor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mentor'
 *       404:
 *         description: Mentor not found
 *       400:
 *         description: Bad request
 */
router.put("/mentors/:id", updateMentor);

/**
 * @swagger
 * /mentors/{id}:
 *   delete:
 *     summary: Delete a mentor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     responses:
 *       200:
 *         description: Mentor deleted
 *       404:
 *         description: Mentor not found
 */
router.delete("/mentors/:id", deleteMentor);

// add student to mentor

/**
 * @swagger
 * /mentors/addStudent/{id}:
 *   put:
 *     summary: Add a student to a mentor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The student ID
 *     responses:
 *       200:
 *         description: The updated mentor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mentor'
 *       404:
 *         description: Mentor not found
 *       400:
 *         description: Bad request
 */
router.put("/mentors/addStudent/:id", addStudent);

// get students of a mentor

/**
 * @swagger
 * /mentors/students/{id}:
 *   get:
 *     summary: Retrieve students of a mentor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     responses:
 *       200:
 *         description: A list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: Mentor not found
 */

router.get("/mentors/students/:id", getStudents);

// login mentor

/**
 * @swagger
 * /mentors/login:
 *   post:
 *     summary: Login mentor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empId:
 *                 type: string
 *                 description: The mentor empId
 *               password:
 *                 type: string
 *                 description: The mentor password
 *     responses:
 *       200:
 *         description: The mentor logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mentor'
 *       404:
 *         description: Mentor not found
 *       400:
 *         description: Bad request
 */

router.post("/mentors/login", loginMentor);

// update mentor password

/**
 * @swagger
 * /mentors/updatePassword/{id}:
 *   put:
 *     summary: Update mentor password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The mentor old password
 *               newPassword:
 *                 type: string
 *                 description: The mentor new password
 *     responses:
 *       200:
 *         description: The updated mentor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mentor'
 *       404:
 *         description: Mentor not found
 *       400:
 *         description: Bad request
 */

router.put("/mentors/updatePassword/:id", updatePassword);

export default router;
