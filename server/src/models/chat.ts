// models/chat.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage {
  _id?: Types.ObjectId;
  sender: string; // srNo for student, empId for mentor
  senderType: 'mentor' | 'student';
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IChat extends Document {
  mentorEmpId: string;
  studentSrNo: string;
  messages: IMessage[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount?: {
    student: number; // Messages unread by student
    mentor: number;  // Messages unread by mentor
  };
}

const messageSchema = new Schema<IMessage>({
  sender: { 
    type: String, 
    required: true 
  },
  senderType: { 
    type: String, 
    enum: ['mentor', 'student'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { _id: true });

const chatSchema = new Schema<IChat>({
  mentorEmpId: { 
    type: String, 
    required: true,
    index: true 
  },
  studentSrNo: { 
    type: String, 
    required: true,
    index: true 
  },
  messages: [messageSchema],
  lastMessage: { 
    type: String, 
    default: '' 
  },
  lastMessageTime: { 
    type: Date, 
    default: Date.now 
  },
  unreadCount: {
    student: { type: Number, default: 0 },
    mentor: { type: Number, default: 0 }
  }
}, { 
  timestamps: true 
});

// Compound unique index
chatSchema.index({ mentorEmpId: 1, studentSrNo: 1 }, { unique: true });

// Update unread counts before save
chatSchema.pre('save', function(next) {
  if (!this.mentorEmpId || !this.studentSrNo) {
    next(new Error('mentorEmpId and studentSrNo are required'));
  } else {
    // Calculate unread counts
    this.unreadCount = {
      student: this.messages.filter(msg => msg.senderType === 'mentor' && !msg.read).length,
      mentor: this.messages.filter(msg => msg.senderType === 'student' && !msg.read).length
    };
    next();
  }
});

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;