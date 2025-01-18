// crud controller for mentor model

import { Request, Response } from "express";
import Mentor from "../models/mentor";
import Student from "../models/student";

// Get all mentors
export const getMentors = async (req: Request, res: Response): Promise<any> => {
  try {
    const mentors = await Mentor.find();
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

//fetch by empId
export const getMentorByEmpId = async (
  req: Request<{
    empId: string;
  }>,
  res: Response
): Promise<any> => {
  try {
    const mentor = await Mentor.findOne({ empId: req.params.empId });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create a new mentor
export const createMentor = async (
  req: Request,
  res: Response
): Promise<any> => {
  const mentor = new Mentor(req.body);
  try {
    const newMentor = await mentor.save();
    res.status(201).json(newMentor);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Update a mentor by ID
export const updateMentor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Delete a mentor by ID
export const deleteMentor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json({ message: "Mentor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Add a student to a mentor
export const addStudent = async (req: Request, res: Response): Promise<any> => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    mentor.students.push(req.body.studentId);
    //save on student side as well
    const student = await Student.findById(req.body.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    //@ts-expect-error
    student.mentor = mentor._id;

    await student.save({ validateBeforeSave: false });
    await mentor.save();
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// get students of a mentor
export const getStudents = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    const students = await Student.find({ mentor: mentor?._id }).populate(
      "mentor"
    );
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Login mentor

export const loginMentor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const mentor = await Mentor.findOne({ empId: req.body.empId });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    const valid = await Bun.password.verify(req.body.password, mentor.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// update mentor password

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    const valid = await Bun.password.verify(
      req.body.oldPassword,
      mentor.password
    );
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    mentor.password = req.body.newPassword;
    await mentor.save();
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
