// controllers/email.ts
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Student from "../models/student";
import Mentor from "../models/mentor";

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

// Send email from mentor to mentee
export const sendMentorToMenteeEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { mentorId, studentId, subject, message } = req.body;

    // Validate inputs
    if (!mentorId || !studentId || !subject || !message) {
      return res.status(400).json({ 
        message: "Mentor ID, Student ID, subject, and message are required" 
      });
    }

    // Fetch mentor and student details
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: `[Mentor Message] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #3f51b5; border-bottom: 2px solid #3f51b5; padding-bottom: 10px;">
              Message from Your Mentor
            </h2>
            <div style="margin: 20px 0;">
              <p style="color: #666; margin-bottom: 5px;"><strong>From:</strong> ${mentor.name}</p>
              <p style="color: #666; margin-bottom: 5px;"><strong>Email:</strong> ${mentor.email}</p>
              <p style="color: #666; margin-bottom: 20px;"><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #3f51b5; margin: 20px 0;">
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              <p>This is an automated message from the Mentor-Mentee System.</p>
              <p>Please do not reply to this email. Contact your mentor directly at ${mentor.email}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Email sent successfully",
      sentTo: student.email,
      sentBy: mentor.name
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ 
      message: "Failed to send email", 
      error: (error as Error).message 
    });
  }
};

// Send email from mentee to mentor
export const sendMenteeToMentorEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId, mentorId, subject, message, studentEmail } = req.body;

    // Validate inputs
    if (!studentId || !mentorId || !subject || !message || !studentEmail) {
      return res.status(400).json({ 
        message: "Student ID, Mentor ID, student email, subject, and message are required" 
      });
    }

    // Fetch student and mentor details
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: mentor.email,
      replyTo: studentEmail, // Allow mentor to reply directly to student
      subject: `[Mentee Message] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4caf50; border-bottom: 2px solid #4caf50; padding-bottom: 10px;">
              Message from Your Mentee
            </h2>
            <div style="margin: 20px 0;">
              <p style="color: #666; margin-bottom: 5px;"><strong>From:</strong> ${student.name}</p>
              <p style="color: #666; margin-bottom: 5px;"><strong>USN:</strong> ${student.usn}</p>
              <p style="color: #666; margin-bottom: 5px;"><strong>Email:</strong> ${studentEmail}</p>
              <p style="color: #666; margin-bottom: 20px;"><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0;">
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              <p>This is an automated message from the Mentor-Mentee System.</p>
              <p>You can reply directly to this email to contact your mentee at ${studentEmail}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Email sent successfully",
      sentTo: mentor.email,
      sentBy: student.name,
      replyTo: studentEmail
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ 
      message: "Failed to send email", 
      error: (error as Error).message 
    });
  }
};

// Get email history (optional - requires email history model)
export const getEmailHistory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({ 
        message: "User ID and user type are required" 
      });
    }

    // Implement email history retrieval logic here
    // This would require creating an EmailHistory model
    
    res.status(200).json({ 
      message: "Email history feature coming soon",
      emails: []
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch email history", 
      error: (error as Error).message 
    });
  }
};