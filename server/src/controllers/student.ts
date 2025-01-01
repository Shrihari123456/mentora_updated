import { Request, Response } from "express";
import Student from "../models/student";

// Get all students
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find().populate("mentor", "name");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get a single student by ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "mentor",
      "name"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

//fetch by srNo
export const getStudentBySrNo = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ srNo: req.params.srNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error: unknown) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// fetch by usn
export const getStudentByUsn = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ usn: req.params.usn });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

//get all unassigned students
export const getUnassignedStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({
      mentor: { $exists: false },
    });
    res.status(200).json(students);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create a new student
export const createStudent = async (req: Request, res: Response) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Update a student by ID
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateStudentBySrNo = async (req: Request, res: Response) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { srNo: req.params.srNo },
      req.body,
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a student by ID
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// login student
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ srNo: req.body.srNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const isMatch = await Bun.password.verify(
      req.body.password,
      student.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// update student password

export const updateStudentPassword = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const isMatch = await Bun.password.verify(
      req.body.oldPassword,
      student.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    student.password = req.body.newPassword;
    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
