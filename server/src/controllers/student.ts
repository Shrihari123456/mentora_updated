import { Request, Response } from "express";
import Student from "../models/student";

// SIMPLE LOGIN - srNo and first name as password
export const loginStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { srNo, password } = req.body;

    console.log('Login attempt:', { srNo, password });

    if (!srNo || !password) {
      return res.status(400).json({ 
        success: false,
        message: "SR Number and password are required" 
      });
    }

    // Find student by srNo
    const student = await Student.findOne({ srNo }).select('+password');
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found with this SR Number" 
      });
    }

    console.log('Found student:', student.name, 'Password hash:', student.password?.substring(0, 20));

    // Check if password matches (first name in lowercase)
    const studentFirstName = student.name.toLowerCase().split(' ')[0];
    const providedPassword = password.toLowerCase().trim();
    
    // For testing: Also check if password matches directly (unhashed)
    // Remove this in production after all passwords are hashed
    if (studentFirstName !== providedPassword) {
      // Check if it matches hashed password (for already hashed passwords)
      if (typeof Bun !== 'undefined') {
        try {
          const isMatch = await Bun.password.verify(providedPassword, student.password);
          if (!isMatch) {
            return res.status(401).json({ 
              success: false,
              message: "Invalid credentials. Password should be your first name." 
            });
          }
        } catch (hashError) {
          return res.status(401).json({ 
            success: false,
            message: "Invalid credentials. Password should be your first name." 
          });
        }
      } else {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials. Password should be your first name." 
        });
      }
    }

    // Return student data without password
    const studentData = student.toObject();
    // delete studentData.password;
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      student: studentData,
      token: null, // You can add JWT token here if needed
      role: 'student'
    });
    
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: error.message 
    });
  }
};

// Optional: Reset password to first name (for imported students)
export const resetStudentPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { srNo } = req.body;

    if (!srNo) {
      return res.status(400).json({ 
        success: false,
        message: "SR Number is required" 
      });
    }

    const student = await Student.findOne({ srNo });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Reset password to first name
    const firstName = student.name.toLowerCase().split(' ')[0];
    student.password = firstName;
    await student.save();

    res.status(200).json({ 
      success: true,
      message: "Password reset to first name successfully",
      hint: `Password is: ${firstName}`
    });
    
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};