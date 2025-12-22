// models/emailMessage.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmailMessage extends Document {
  senderId: string; // studentSrNo or mentorEmpId
  senderType: 'student' | 'mentor';
  senderName: string;
  recipientId: string; // studentSrNo or mentorEmpId
  recipientType: 'student' | 'mentor';
  recipientName: string;
  subject: string;
  body: string;
  attachments?: {
    filename: string;
    url: string;
    size: number;
    type: string;
  }[];
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  priority: 'low' | 'normal' | 'high';
  threadId: string; // For grouping conversations
  parentMessageId?: Types.ObjectId; // For replies
  sentAt: Date;
  deletedBySender: boolean;
  deletedByRecipient: boolean;
  message:string;
}

const attachmentSchema = new Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true }
});

const emailMessageSchema = new Schema<IEmailMessage>({
  senderId: { type: String, required: true, index: true },
  senderType: { type: String, enum: ['student', 'mentor'], required: true },
  senderName: { type: String, required: true },
  recipientId: { type: String, required: true, index: true },
  recipientType: { type: String, enum: ['student', 'mentor'], required: true },
  recipientName: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  attachments: [attachmentSchema],
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  labels: { type: [String], default: [] },
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high'],
    default: 'normal' 
  },
  threadId: { type: String, required: true, index: true },
  parentMessageId: { type: Schema.Types.ObjectId, ref: 'EmailMessage' },
  sentAt: { type: Date, default: Date.now, index: true },
  deletedBySender: { type: Boolean, default: false },
  deletedByRecipient: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for efficient queries
emailMessageSchema.index({ senderId: 1, deletedBySender: 1, sentAt: -1 });
emailMessageSchema.index({ recipientId: 1, deletedByRecipient: 1, sentAt: -1 });
emailMessageSchema.index({ threadId: 1, sentAt: -1 });
emailMessageSchema.index({ senderId: 1, recipientId: 1 });

const EmailMessage = mongoose.model<IEmailMessage>("EmailMessage", emailMessageSchema);

export default EmailMessage;