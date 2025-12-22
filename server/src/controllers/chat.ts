// controllers/chatController.ts
import { Request, Response } from "express";
import Chat, { IMessage } from "../models/chat";
import Student from "../models/student";
import Mentor from "../models/mentor";

interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Get chat messages with auto-detection based on role
export const getChatMessages = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { role, srNo, empId, studentSrNo, mentorEmpId } = req.query;

    console.log('📨 Getting chat messages with params:', {
      role, srNo, empId, studentSrNo, mentorEmpId
    });

    // Validate role
    if (!role || !['student', 'mentor'].includes(role as string)) {
      res.status(400).json({
        success: false,
        message: "Valid role (student/mentor) is required"
      });
      return;
    }

    let finalStudentSrNo: string;
    let finalMentorEmpId: string;

    // For students: Use their SR No and find assigned mentor
    if (role === 'student') {
      if (!srNo) {
        res.status(400).json({
          success: false,
          message: "Student SR No is required"
        });
        return;
      }
      
      finalStudentSrNo = srNo as string;
      
      // Get student and assigned mentor
      const student = await Student.findOne({ srNo: finalStudentSrNo });
      if (!student) {
        res.status(404).json({
          success: false,
          message: "Student not found"
        });
        return;
      }
      
      if (!student.mentor) {
        res.status(404).json({
          success: false,
          message: "No mentor assigned to this student"
        });
        return;
      }
      
      const mentor = await Mentor.findById(student.mentor);
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: "Assigned mentor not found"
        });
        return;
      }
      
      finalMentorEmpId = mentor.empId;
    } 
    // For mentors: They need to specify which student
    else if (role === 'mentor') {
      if (!empId) {
        res.status(400).json({
          success: false,
          message: "Mentor Emp ID is required"
        });
        return;
      }
      
      finalMentorEmpId = empId as string;
      
      if (!studentSrNo) {
        res.status(400).json({
          success: false,
          message: "Student SR No is required for mentor"
        });
        return;
      }
      
      finalStudentSrNo = studentSrNo as string;
      
      // Verify this mentor is assigned to this student
      const student = await Student.findOne({ srNo: finalStudentSrNo });
      if (!student) {
        res.status(404).json({
          success: false,
          message: "Student not found"
        });
        return;
      }
      
      const mentor = await Mentor.findOne({ empId: finalMentorEmpId });
      if (!mentor || !student.mentor || !student.mentor.equals(mentor._id)) {
        res.status(403).json({
          success: false,
          message: "You are not assigned as mentor for this student"
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid role"
      });
      return;
    }

    // Find chat
    const chat = await Chat.findOne({ 
      mentorEmpId: finalMentorEmpId, 
      studentSrNo: finalStudentSrNo
    });

    // Get user details
    const [student, mentor] = await Promise.all([
      Student.findOne({ srNo: finalStudentSrNo }).select('name srNo photo section'),
      Mentor.findOne({ empId: finalMentorEmpId }).select('name empId photo department')
    ]);

    const responseData: any = {
      success: true,
      studentInfo: {
        srNo: student?.srNo || finalStudentSrNo,
        name: student?.name || 'Student',
        photo: student?.photo,
        section: student?.section
      },
      mentorInfo: {
        empId: mentor?.empId || finalMentorEmpId,
        name: mentor?.name || 'Mentor',
        // photo: mentor?.photo,
        // department: mentor?.department
      }
    };

    if (!chat) {
      responseData.chat = null;
      responseData.messages = [];
    } else {
      responseData.chat = {
        _id: chat._id,
        mentorEmpId: chat.mentorEmpId,
        studentSrNo: chat.studentSrNo,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime
      };
      responseData.messages = chat.messages || [];
    }

    console.log('✅ Chat data retrieved successfully');
    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Error in getChatMessages:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

// Send message
export const sendChatMessage = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { role, srNo, empId, content, studentSrNo, mentorEmpId } = req.body;

    console.log('📤 Sending message:', { role, srNo, empId, content });

    if (!role || !['student', 'mentor'].includes(role)) {
      res.status(400).json({ 
        success: false,
        message: "Valid role (student/mentor) is required" 
      });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Message content is required" 
      });
      return;
    }

    let finalStudentSrNo: string;
    let finalMentorEmpId: string;

    // For students: Use their SR No and find assigned mentor
    if (role === 'student') {
      if (!srNo) {
        res.status(400).json({ 
          success: false,
          message: "Student SR No is required" 
        });
        return;
      }
      
      finalStudentSrNo = srNo;
      
      // Get assigned mentor
      const student = await Student.findOne({ srNo: finalStudentSrNo });
      if (!student || !student.mentor) {
        res.status(404).json({ 
          success: false,
          message: "No mentor assigned to you" 
        });
        return;
      }
      
      const mentor = await Mentor.findById(student.mentor);
      if (!mentor) {
        res.status(404).json({ 
          success: false,
          message: "Assigned mentor not found" 
        });
        return;
      }
      
      finalMentorEmpId = mentor.empId;
    } 
    // For mentors: They need to specify student
    else {
      if (!empId) {
        res.status(400).json({ 
          success: false,
          message: "Mentor Emp ID is required" 
        });
        return;
      }
      
      finalMentorEmpId = empId;
      
      if (!studentSrNo) {
        res.status(400).json({ 
          success: false,
          message: "Student SR No is required for mentor" 
        });
        return;
      }
      
      finalStudentSrNo = studentSrNo;
      
      // Verify mentor-student relationship
      const student = await Student.findOne({ srNo: finalStudentSrNo });
      if (!student) {
        res.status(404).json({ 
          success: false,
          message: "Student not found" 
        });
        return;
      }
      
      const mentor = await Mentor.findOne({ empId: finalMentorEmpId });
      if (!mentor || !student.mentor || !student.mentor.equals(mentor._id)) {
        res.status(403).json({ 
          success: false,
          message: "You are not assigned as mentor for this student" 
        });
        return;
      }
    }

    // Find or create chat
    let chat = await Chat.findOne({ 
      mentorEmpId: finalMentorEmpId, 
      studentSrNo: finalStudentSrNo 
    });

    if (!chat) {
      console.log('🆕 Creating new chat');
      chat = new Chat({
        mentorEmpId: finalMentorEmpId,
        studentSrNo: finalStudentSrNo,
        messages: [],
        lastMessage: "",
        lastMessageTime: new Date()
      });
    }

    const newMessage: IMessage = {
      sender: role === 'student' ? finalStudentSrNo : finalMentorEmpId,
      senderType: role as 'mentor' | 'student',
      content: content.trim(),
      timestamp: new Date(),
      read: false,
    };

    chat.messages.push(newMessage);
    chat.lastMessage = content.trim();
    chat.lastMessageTime = new Date();
    
    await chat.save();

    console.log('✅ Message sent successfully');
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chat: {
        mentorEmpId: chat.mentorEmpId,
        studentSrNo: chat.studentSrNo,
        messages: chat.messages,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime
      }
    });
  } catch (error: any) {
    console.error("❌ Error in sendChatMessage:", error);
    
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false,
        message: "Chat already exists",
        error: error.message
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: (error as Error).message 
      });
    }
  }
};

// Get all students for a mentor
export const getMentorStudents = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { empId } = req.params;

    if (!empId) {
      res.status(400).json({
        success: false,
        message: "Mentor Emp ID is required"
      });
      return;
    }

    const mentor = await Mentor.findOne({ empId });
    if (!mentor) {
      res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
      return;
    }

    // Find all students assigned to this mentor
    const students = await Student.find({ mentor: mentor._id })
      .select('name srNo email section photo')
      .sort({ name: 1 });

    // Get chat info for each student
    const studentsWithChatInfo = await Promise.all(
      students.map(async (student) => {
        const chat = await Chat.findOne({
          mentorEmpId: mentor.empId,
          studentSrNo: student.srNo
        });

        return {
          _id: student._id,
          name: student.name,
          srNo: student.srNo,
          email: student.email,
          section: student.section,
          photo: student.photo,
          hasChat: !!chat,
          lastMessage: chat?.lastMessage,
          lastMessageTime: chat?.lastMessageTime,
          unreadCount: chat ? chat.messages.filter(msg => 
            msg.senderType === 'student' && !msg.read
          ).length : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      mentor: {
        empId: mentor.empId,
        name: mentor.name,
        email: mentor.email,
        // department: mentor.department
      },
      students: studentsWithChatInfo
    });
  } catch (error) {
    console.error("❌ Error in getMentorStudents:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

// Get student's assigned mentor and chat
export const getStudentChatInfo = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { srNo } = req.params;

    if (!srNo) {
      res.status(400).json({
        success: false,
        message: "Student SR No is required"
      });
      return;
    }

    const student = await Student.findOne({ srNo })
      .populate('mentor', 'empId name email department photo');

    if (!student) {
      res.status(404).json({
        success: false,
        message: "Student not found"
      });
      return;
    }

    if (!student.mentor) {
      res.status(200).json({
        success: true,
        student: {
          srNo: student.srNo,
          name: student.name,
          section: student.section
        },
        mentor: null,
        chat: null,
        message: "No mentor assigned"
      });
      return;
    }

    const mentor = student.mentor as any;
    
    // Get chat if exists
    const chat = await Chat.findOne({
      mentorEmpId: mentor.empId,
      studentSrNo: student.srNo
    });

    res.status(200).json({
      success: true,
      student: {
        srNo: student.srNo,
        name: student.name,
        section: student.section,
        photo: student.photo
      },
      mentor: {
        empId: mentor.empId,
        name: mentor.name,
        email: mentor.email,
        department: mentor.department,
        photo: mentor.photo
      },
      chat: chat ? {
        _id: chat._id,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        unreadCount: chat.messages.filter(msg => 
          msg.senderType === 'mentor' && !msg.read
        ).length
      } : null
    });
  } catch (error) {
    console.error("❌ Error in getStudentChatInfo:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { role, studentSrNo, mentorEmpId } = req.body;

    if (!role || !["mentor", "student"].includes(role)) {
      res.status(400).json({ 
        success: false,
        message: "Valid role (mentor or student) is required" 
      });
      return;
    }

    if (!studentSrNo || !mentorEmpId) {
      res.status(400).json({
        success: false,
        message: "studentSrNo and mentorEmpId are required"
      });
      return;
    }

    const chat = await Chat.findOne({ 
      mentorEmpId, 
      studentSrNo 
    });

    if (!chat) {
      res.status(200).json({ 
        success: true,
        message: "No chat found",
        markedCount: 0
      });
      return;
    }

    const oppositeType = role === "mentor" ? "student" : "mentor";
    let markedCount = 0;
    
    chat.messages.forEach((msg: IMessage) => {
      if (msg.senderType === oppositeType && !msg.read) {
        msg.read = true;
        markedCount++;
      }
    });

    if (markedCount > 0) {
      await chat.save();
    }
    
    console.log('✅ Marked', markedCount, 'messages as read');
    res.status(200).json({ 
      success: true,
      message: `${markedCount} messages marked as read`,
      markedCount 
    });
  } catch (error) {
    console.error("❌ Error in markMessagesAsRead:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

// Get all chats for mentor dashboard
export const getMentorChats = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { empId } = req.params;

    if (!empId) {
      res.status(400).json({
        success: false,
        message: "Mentor Emp ID is required"
      });
      return;
    }

    const chats = await Chat.find({ mentorEmpId: empId })
      .sort({ lastMessageTime: -1 });

    // Enrich with student info
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const student = await Student.findOne({ srNo: chat.studentSrNo })
          .select('name srNo photo section');
        
        return {
          chatId: chat._id,
          studentSrNo: chat.studentSrNo,
          studentName: student?.name || 'Student',
          studentPhoto: student?.photo,
          studentSection: student?.section,
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime,
          unreadCount: chat.messages.filter(msg => 
            msg.senderType === 'student' && !msg.read
          ).length,
          totalMessages: chat.messages.length
        };
      })
    );

    res.status(200).json({
      success: true,
      chats: enrichedChats
    });
  } catch (error) {
    console.error("❌ Error in getMentorChats:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};