import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  sender: string;
  senderType: 'mentor' | 'student';
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IChat extends Document {
  mentorEmpId: string; // MNT001
  studentSrNo: string; // CA242711
  messages: IMessage[];
  lastMessage: string;
  lastMessageTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  sender: { type: String, required: true },
  senderType: { type: String, required: true, enum: ['mentor', 'student'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const ChatSchema = new Schema({
  mentorEmpId: { type: String, required: true, default: 'MNT001' },
  studentSrNo: { type: String, required: true, default: 'CA242711' },
  messages: [MessageSchema],
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
ChatSchema.index({ mentorEmpId: 1, studentSrNo: 1 }, { unique: true });
ChatSchema.index({ lastMessageTime: -1 });

export const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);