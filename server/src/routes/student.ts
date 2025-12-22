import { Router } from "express";
import {
  // getStudents,
  // getStudentById,
  // createStudent,
  // updateStudent,
  // deleteStudent,
  // getStudentByUsn,
  // getStudentBySrNo,
  loginStudent,
  // updateStudentPassword,
  // getUnassignedStudents,
  // updateStudentBySrNo,
  // addStudentMarks,
  resetStudentPassword // Add this import
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
//  */
// studRouter.get("/", getStudents);

/**
 * @swagger
 * /students/unassigned:
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
// studRouter.get("/unassigned", getUnassignedStudents);

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
// studRouter.get("/:id", getStudentById);

/**
 * @swagger
 * /students/srNo/{srNo}:
 *   get:
 *     summary: Retrieve a student by SR Number
 *     parameters:
 *       - in: path
 *         name: srNo
 *         required: true
 *         schema:
 *           type: string
 *         description: The student's SR Number
 *     responses:
 *       200:
 *         description: A student record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */
// studRouter.get("/srNo/:srNo", getStudentBySrNo);

/**
 * @swagger
 * /students/usn/{usn}:
 *   get:
 *     summary: Retrieve a student by USN
 *     parameters:
 *       - in: path
 *         name: usn
 *         required: true
 *         schema:
 *           type: string
 *         description: The student's USN
 *     responses:
 *       200:
 *         description: A student record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
//  */
// studRouter.get("/usn/:usn", getStudentByUsn);

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
// studRouter.post("/", createStudent);

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
// studRouter.put("/:id", updateStudent);

/**
 * @swagger
 * /students/srNo/{srNo}:
 *   put:
 *     summary: Update a student by SR Number
 *     parameters:
 *       - in: path
 *         name: srNo
 *         required: true
 *         schema:
 *           type: string
 *         description: The student's SR Number
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
// studRouter.put("/srNo/:srNo", updateStudentBySrNo);

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
// studRouter.delete("/:id", deleteStudent);

/**
 * @swagger
 * /students/login:
 *   post:
 *     summary: Student login with SR Number and password
 *     description: Password should be the student's first name in lowercase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - srNo
 *               - password
 *             properties:
 *               srNo:
 *                 type: string
 *                 example: "CA24771"
 *                 description: Student's SR Number
 *               password:
 *                 type: string
 *                 example: "ashika"
 *                 description: Student's first name in lowercase
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *                 role:
 *                   type: string
 *                   example: "student"
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
studRouter.post("/students/login", loginStudent);

/**
 * @swagger
 * /students/reset-password:
 *   post:
 *     summary: Reset student password to first name
 *     description: Resets password to the student's first name (for imported students)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - srNo
 *             properties:
 *               srNo:
 *                 type: string
 *                 example: "CA24771"
 *                 description: Student's SR Number
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset to first name successfully"
 *                 hint:
 *                   type: string
 *                   example: "Password is: ashika"
 *       400:
 *         description: SR Number is required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
studRouter.post("/reset-password", resetStudentPassword);

/**
 * @swagger
 * /students/password/{id}:
 *   put:
 *     summary: Update student password
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
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "ashika"
 *                 description: Current password (first name)
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid old password
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
// studRouter.put("/password/:id", updateStudentPassword);

/**
 * @swagger
 * /students/marks:
 *   post:
 *     summary: Add student marks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               semesterData:
 *                 type: object
 *                 description: Semester marks data
 *     responses:
 *       200:
 *         description: Marks added successfully
 *       400:
 *         description: Invalid data format
 *       500:
 *         description: Server error
 */
// studRouter.post("/marks", addStudentMarks);

export default studRouter;