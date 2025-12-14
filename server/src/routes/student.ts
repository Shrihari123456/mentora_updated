import { Router } from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentByUsn,
  getStudentBySrNo,
  loginStudent,
  updateStudentPassword,
  getUnassignedStudents,
  updateStudentBySrNo,

  addStudentMarks
} from "../controllers/student";

const studRouter = Router();

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Retrieve a list of students
 *     responses:
 *       200:
 *         description: A list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
studRouter.get("/students", getStudents);
//get all unassigned students
/**@swagger
 * /students-unassigned:
 *   get:
 *     summary: Retrieve a list of unassigned students
 *     parameters:
 *       - in: query
 *         name: admissionYear
 *         schema:
 *           type: string
 *         description: The admission year of the student
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: The section of the student
 *     responses:
 *       200:
 *         description: A list of unassigned students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: No unassigned students found
 */
studRouter.get("/students-unassigned", getUnassignedStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Retrieve a single student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: A single student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */

//fetch by srNo

studRouter.get("/students/srNo/:srNo", getStudentBySrNo);

//fetch by usn

studRouter.get("/students/usn/:usn", getStudentByUsn);

studRouter.get("/students/:id", getStudentById);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: The created student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request
 */
studRouter.post("/students", createStudent);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: The updated student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       400:
 *         description: Bad request
 */

studRouter.put("/students/:id", updateStudent);

studRouter.put("/students/srNo/:srNo", updateStudentBySrNo);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */

studRouter.delete("/students/:id", deleteStudent);

// login student

studRouter.post("/students/login", loginStudent);

// update password

studRouter.put("/students/password/:id", updateStudentPassword);
// add student marks
//  studRouter.post("/students/marks", addStudentMarks);




export default studRouter;
