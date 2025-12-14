import { Request, Response } from "express";
import { Chat, IMessage } from "../models/chat";

// HARDCODED VALUES
const STUDENT_SRNO = "CA242711";
const MENTOR_EMPID = "MNT001";

interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Get chat messages
export const getChatMessages = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    console.log('Getting chat messages for:', { STUDENT_SRNO, MENTOR_EMPID });
    
    // Find chat with hardcoded values
    const chat = await Chat.findOne({ 
      mentorEmpId: MENTOR_EMPID, 
      studentSrNo: STUDENT_SRNO 
    });

    if (!chat) {
      // Return empty chat if not found
      res.status(200).json({
        success: true,
        chat: {
          mentorEmpId: MENTOR_EMPID,
          studentSrNo: STUDENT_SRNO,
          messages: [],
          lastMessage: '',
          lastMessageTime: new Date()
        },
        messages: []
      });
      return;
    }

    res.status(200).json({
      success: true,
      chat: {
        mentorEmpId: chat.mentorEmpId,
        studentSrNo: chat.studentSrNo,
        messages: chat.messages,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      messages: chat.messages || []
    });
  } catch (error) {
    console.error("Error in getChatMessages:", error);
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
    const { senderType, content } = req.body;

    console.log('Sending message:', { senderType, content, STUDENT_SRNO, MENTOR_EMPID });

    // Validate input
    if (!content || !senderType) {
      res.status(400).json({ 
        success: false,
        message: "Missing required fields: content and senderType" 
      });
      return;
    }

    if (!["mentor", "student"].includes(senderType)) {
      res.status(400).json({ 
        success: false,
        message: "Invalid sender type. Must be 'mentor' or 'student'" 
      });
      return;
    }

    // Find or create chat with hardcoded values
    let chat = await Chat.findOne({ 
      mentorEmpId: MENTOR_EMPID, 
      studentSrNo: STUDENT_SRNO 
    });

    if (!chat) {
      chat = new Chat({
        mentorEmpId: MENTOR_EMPID,
        studentSrNo: STUDENT_SRNO,
        messages: [],
        lastMessage: "",
        lastMessageTime: new Date()
      });
      console.log('Created new chat');
    }

    // Create message
    const newMessage: IMessage = {
      sender: senderType === 'student' ? STUDENT_SRNO : MENTOR_EMPID,
      senderType: senderType as 'mentor' | 'student',
      content: content.trim(),
      timestamp: new Date(),
      read: false,
    };

    // Add message
    chat.messages.push(newMessage);
    chat.lastMessage = content.trim();
    chat.lastMessageTime = new Date();
    
    await chat.save();

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
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
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
    const { readerType } = req.body;

    console.log('Marking messages as read for:', { readerType, STUDENT_SRNO, MENTOR_EMPID });

    if (!readerType || !["mentor", "student"].includes(readerType)) {
      res.status(400).json({ 
        success: false,
        message: "Valid readerType (mentor or student) is required" 
      });
      return;
    }

    const chat = await Chat.findOne({ 
      mentorEmpId: MENTOR_EMPID, 
      studentSrNo: STUDENT_SRNO 
    });

    if (!chat) {
      res.status(404).json({ 
        success: false,
        message: "Chat not found" 
      });
      return;
    }

    // Mark messages as read
    const oppositeType = readerType === "mentor" ? "student" : "mentor";
    let markedCount = 0;
    
    chat.messages.forEach((msg: IMessage) => {
      if (msg.senderType === oppositeType && !msg.read) {
        msg.read = true;
        markedCount++;
      }
    });

    await chat.save();
    
    res.status(200).json({ 
      success: true,
      message: `${markedCount} messages marked as read`,
      markedCount 
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

// Clear chat (optional, for testing)
export const clearChat = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    await Chat.deleteOne({ 
      mentorEmpId: MENTOR_EMPID, 
      studentSrNo: STUDENT_SRNO 
    });
    
    res.status(200).json({ 
      success: true,
      message: "Chat cleared successfully"
    });
  } catch (error) {
    console.error("Error in clearChat:", error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};