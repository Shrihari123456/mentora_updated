import { Request, Response } from "express";
import Student from "../models/student";
import Admin from "../models/admin";

// Verify a student's marks
export const verifyStudentMarks = async (req: Request, res: Response) => {
  try {
    const { studentId, semester, subject } = req.body;
    const adminId = req.params.adminId;

    // Check admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Fetch student and find the subject in that semester
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const targetMark = student.marks.find(
      (mark) => mark.semester === semester && mark.subject === subject
    );

    if (!targetMark) {
      return res.status(404).json({ message: "Subject not found for student in this semester" });
    }

    // Update verification
    targetMark.isVerified = true;
    targetMark.isVerified = true
    targetMark.verifiedBy = admin.id;

    await student.save();

    res.status(200).json({ message: "Marks verified successfully", student });
  } catch (error) {
    console.error("Error verifying student marks:", error);
    res.status(500).json({ message: "Server error occurred" });
  }
};
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ message: "Admin ID and password are required" });
    }

    // Check if adminId and password match
    if (adminId === "admin123" && password === "secretpass") {
      // Return admin data (you can customize this)
      const adminData = {
        id: "admin123",
        name: "System Administrator",
        role: "admin"
      };
      
      return res.status(200).json({ 
        message: "Admin authenticated",
        success: true,
        admin: adminData 
      });
    } else {
      return res.status(401).json({ 
        message: "Invalid admin credentials",
        success: false 
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ 
      message: "Server error occurred",
      success: false 
    });
  }
};