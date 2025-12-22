// controllers/emailController.ts
import { Request, Response } from "express";
import EmailMessage from "../models/email";
import Student from "../models/student";
import Mentor from "../models/mentor";
import mongoose from "mongoose";

// Generate thread ID for conversations
const generateThreadId = () => {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Send email
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const {
      senderId,
      senderType,
      recipientId,
      recipientType,
      subject,
      body,
      attachments,
      parentMessageId,
      priority = 'normal'
    } = req.body;

    // Validate sender and recipient types
    if (!['student', 'mentor'].includes(senderType) || !['student', 'mentor'].includes(recipientType)) {
      return res.status(400).json({ message: "Invalid sender or recipient type" });
    }

    // Get sender details
    let sender: any = null;
    let senderName = '';
    
    if (senderType === 'student') {
      sender = await Student.findOne({ srNo: senderId });
      senderName = sender?.name || 'Unknown Student';
    } else {
      sender = await Mentor.findOne({ empId: senderId });
      senderName = sender?.name || 'Unknown Mentor';
    }

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Get recipient details
    let recipient: any = null;
    let recipientName = '';
    
    if (recipientType === 'student') {
      recipient = await Student.findOne({ srNo: recipientId });
      recipientName = recipient?.name || 'Unknown Student';
    } else {
      recipient = await Mentor.findOne({ empId: recipientId });
      recipientName = recipient?.name || 'Unknown Mentor';
    }

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Generate or get thread ID
    let threadId = generateThreadId();
    if (parentMessageId) {
      const parentMessage = await EmailMessage.findById(parentMessageId);
      if (parentMessage) {
        threadId = parentMessage.threadId;
      }
    }

    // Create email message
    const emailMessage = new EmailMessage({
      senderId,
      senderType,
      senderName,
      recipientId,
      recipientType,
      recipientName,
      subject,
      body,
      attachments: attachments || [],
      priority,
      threadId,
      parentMessageId: parentMessageId || null,
      sentAt: new Date(),
      deletedBySender: false,
      deletedByRecipient: false
    });

    await emailMessage.save();

    res.status(201).json({
      message: "Email sent successfully",
      email: emailMessage
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
};

// Get inbox emails for user
export const getInbox = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;
    const { page = 1, limit = 20, label, search, unreadOnly } = req.query;

    const query: any = {
      recipientId: userId,
      recipientType: userType,
      deletedByRecipient: false
    };

    if (label) {
      query.labels = label;
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { senderName: { $regex: search, $options: 'i' } }
      ];
    }

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const emails = await EmailMessage.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await EmailMessage.countDocuments(query);
    const unreadCount = await EmailMessage.countDocuments({
      recipientId: userId,
      recipientType: userType,
      deletedByRecipient: false,
      isRead: false
    });

    res.status(200).json({
      emails,
      total,
      unreadCount,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error: any) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ message: "Error fetching inbox", error: error.message });
  }
};

// Get sent emails
export const getSentEmails = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const emails = await EmailMessage.find({
      senderId: userId,
      senderType: userType,
      deletedBySender: false
    })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await EmailMessage.countDocuments({
      senderId: userId,
      senderType: userType,
      deletedBySender: false
    });

    res.status(200).json({
      emails,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error: any) {
    console.error("Error fetching sent emails:", error);
    res.status(500).json({ message: "Error fetching sent emails", error: error.message });
  }
};

// Get starred emails for user
export const getStarredEmails = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;

    const emails = await EmailMessage.find({
      $or: [
        { 
          senderId: userId, 
          senderType: userType, 
          deletedBySender: false,
          isStarred: true 
        },
        { 
          recipientId: userId, 
          recipientType: userType,
          deletedByRecipient: false,
          isStarred: true 
        }
      ]
    }).sort({ sentAt: -1 });

    res.status(200).json({
      emails,
      total: emails.length
    });
  } catch (error: any) {
    console.error("Error fetching starred emails:", error);
    res.status(500).json({ message: "Error fetching starred emails", error: error.message });
  }
};

// Get email thread
export const getEmailThread = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    
    const emails = await EmailMessage.find({ threadId })
      .sort({ sentAt: 1 })
      .populate('parentMessageId');

    res.status(200).json({ emails });
  } catch (error: any) {
    console.error("Error fetching email thread:", error);
    res.status(500).json({ message: "Error fetching email thread", error: error.message });
  }
};

// Get single email
export const getEmail = async (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;
    
    const email = await EmailMessage.findById(emailId);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Mark as read if recipient is viewing
    const { userId, userType } = req.query;
    if (email.recipientId === userId && email.recipientType === userType && !email.isRead) {
      email.isRead = true;
      await email.save();
    }

    res.status(200).json({ email });
  } catch (error: any) {
    console.error("Error fetching email:", error);
    res.status(500).json({ message: "Error fetching email", error: error.message });
  }
};

// Mark email as read/unread
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;
    const { isRead } = req.body;

    const email = await EmailMessage.findById(emailId);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    email.isRead = isRead;
    await email.save();

    res.status(200).json({ message: "Email updated successfully", email });
  } catch (error: any) {
    console.error("Error marking email:", error);
    res.status(500).json({ message: "Error marking email", error: error.message });
  }
};

// Toggle star
export const toggleStar = async (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;

    const email = await EmailMessage.findById(emailId);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    email.isStarred = !email.isStarred;
    await email.save();

    res.status(200).json({ 
      message: "Email starred status updated", 
      isStarred: email.isStarred 
    });
  } catch (error: any) {
    console.error("Error toggling star:", error);
    res.status(500).json({ message: "Error toggling star", error: error.message });
  }
};

// Add/remove labels
export const updateLabels = async (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;
    const { labels, action = 'add' } = req.body;

    const email = await EmailMessage.findById(emailId);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (action === 'add') {
      labels.forEach((label: string) => {
        if (!email.labels.includes(label)) {
          email.labels.push(label);
        }
      });
    } else if (action === 'remove') {
      email.labels = email.labels.filter(label => !labels.includes(label));
    }

    await email.save();

    res.status(200).json({ 
      message: "Labels updated successfully", 
      labels: email.labels 
    });
  } catch (error: any) {
    console.error("Error updating labels:", error);
    res.status(500).json({ message: "Error updating labels", error: error.message });
  }
};

// Delete email (soft delete)
export const deleteEmail = async (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;
    const { userId, userType } = req.body;

    const email = await EmailMessage.findById(emailId);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Determine if user is sender or recipient
    if (email.senderId === userId && email.senderType === userType) {
      email.deletedBySender = true;
    } else if (email.recipientId === userId && email.recipientType === userType) {
      email.deletedByRecipient = true;
    } else {
      return res.status(403).json({ message: "Unauthorized to delete this email" });
    }

    await email.save();

    // If both sender and recipient have deleted it, delete permanently
    if (email.deletedBySender && email.deletedByRecipient) {
      await EmailMessage.findByIdAndDelete(emailId);
      return res.status(200).json({ message: "Email permanently deleted" });
    }

    res.status(200).json({ message: "Email moved to trash" });
  } catch (error: any) {
    console.error("Error deleting email:", error);
    res.status(500).json({ message: "Error deleting email", error: error.message });
  }
};

// Get trash emails
export const getTrash = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;

    const emails = await EmailMessage.find({
      $or: [
        { senderId: userId, senderType: userType, deletedBySender: true },
        { recipientId: userId, recipientType: userType, deletedByRecipient: true }
      ],
      $and: [
        { 
          $or: [
            { deletedBySender: false },
            { deletedByRecipient: false }
          ]
        }
      ]
    }).sort({ sentAt: -1 });

    res.status(200).json({ emails });
  } catch (error: any) {
    console.error("Error fetching trash:", error);
    res.status(500).json({ message: "Error fetching trash", error: error.message });
  }
};

// Empty trash
export const emptyTrash = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;

    const emails = await EmailMessage.find({
      $or: [
        { senderId: userId, senderType: userType, deletedBySender: true },
        { recipientId: userId, recipientType: userType, deletedByRecipient: true }
      ],
      $and: [
        { 
          $or: [
            { deletedBySender: true },
            { deletedByRecipient: true }
          ]
        }
      ]
    });

    // Delete emails where both sender and recipient have deleted them
    const emailsToDelete = emails.filter(email => 
      (email.senderId === userId && email.senderType === userType && email.deletedBySender) ||
      (email.recipientId === userId && email.recipientType === userType && email.deletedByRecipient)
    );

    const deletePromises = emailsToDelete.map(email => 
      EmailMessage.findByIdAndDelete(email._id)
    );

    await Promise.all(deletePromises);

    res.status(200).json({ 
      message: "Trash emptied successfully", 
      deletedCount: emailsToDelete.length 
    });
  } catch (error: any) {
    console.error("Error emptying trash:", error);
    res.status(500).json({ message: "Error emptying trash", error: error.message });
  }
};

// Get student's mentor info for email composition
export const getMentorInfo = async (req: Request, res: Response) => {
  try {
    const { studentSrNo } = req.params;
    console.log('Fetching mentor for student:', studentSrNo);

    const student = await Student.findOne({ srNo: studentSrNo }).populate('mentor');
    
    if (!student) {
      console.log('Student not found with srNo:', studentSrNo);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log('Student found:', student.name);
    console.log('Mentor assigned:', student.mentor);

    if (!student.mentor) {
      console.log('No mentor assigned to this student');
      return res.status(404).json({ message: "No mentor assigned" });
    }

    const mentor = student.mentor as any;
    
    console.log('Returning mentor info:', mentor.empId, mentor.name);
    res.status(200).json({
      mentorId: mentor.empId,
      mentorName: mentor.name,
      mentorEmail: mentor.email,
      mentorDept: mentor.dept,
      mentorDesignation: mentor.designation
    });
  } catch (error: any) {
    console.error("Error fetching mentor info:", error);
    res.status(500).json({ message: "Error fetching mentor info", error: error.message });
  }
};

// Get mentor's students for email composition
export const getMentorStudents = async (req: Request, res: Response) => {
  try {
    const { mentorEmpId } = req.params;
    console.log('Fetching students for mentor:', mentorEmpId);

    const mentor = await Mentor.findOne({ empId: mentorEmpId }).populate('students');
    
    if (!mentor) {
      console.log('Mentor not found with empId:', mentorEmpId);
      return res.status(404).json({ message: "Mentor not found" });
    }

    console.log('Mentor found:', mentor.name);
    console.log('Number of students:', mentor.students?.length || 0);

    if (!mentor.students || mentor.students.length === 0) {
      console.log('No students assigned to this mentor');
      return res.status(200).json({ students: [], message: 'No students assigned' });
    }

    const students = (mentor.students as any[]).map(student => {
      console.log('Processing student:', student.srNo, student.name);
      return {
        studentId: student.srNo,
        studentName: student.name,
        studentEmail: student.email || student.studentEmail,
        studentSection: student.section,
        admissionYear: student.admissionYear,
        _id: student._id,
        srNo: student.srNo,
        name: student.name,
        email: student.email || student.studentEmail,
        section: student.section
      };
    });

    console.log('Returning students:', students.length);
    res.status(200).json({ students });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Get email statistics
export const getEmailStats = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;

    const [totalReceived, totalSent, unreadCount, starredCount] = await Promise.all([
      EmailMessage.countDocuments({ 
        recipientId: userId, 
        recipientType: userType,
        deletedByRecipient: false 
      }),
      EmailMessage.countDocuments({ 
        senderId: userId, 
        senderType: userType,
        deletedBySender: false 
      }),
      EmailMessage.countDocuments({ 
        recipientId: userId, 
        recipientType: userType,
        deletedByRecipient: false,
        isRead: false 
      }),
      EmailMessage.countDocuments({
        $or: [
          { senderId: userId, senderType: userType, deletedBySender: false },
          { recipientId: userId, recipientType: userType, deletedByRecipient: false }
        ],
        isStarred: true
      })
    ]);

    res.status(200).json({
      totalReceived,
      totalSent,
      unreadCount,
      starredCount
    });
  } catch (error: any) {
    console.error("Error fetching email stats:", error);
    res.status(500).json({ message: "Error fetching email stats", error: error.message });
  }
};