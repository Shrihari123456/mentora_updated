import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  studentId: mongoose.Types.ObjectId;
  sessionId: string;
  message: string;
  response: string;
  timestamp: Date;
  messageType: 'student' | 'bot';
  context?: {
    semester?: number;
    subject?: string;
    topic?: string;
    intent?: string;
  };
}

const chatMessageSchema = new Schema<IChatMessage>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['student', 'bot'],
    required: true
  },
  context: {
    semester: Number,
    subject: String,
    topic: String,
    intent: String
  }
});

// Index for faster queries
chatMessageSchema.index({ studentId: 1, timestamp: -1 });
chatMessageSchema.index({ sessionId: 1 });

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

// Chatbot Configuration Schema
export interface IChatbotConfig extends Document {
  name: string;
  description: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  isActive: boolean;
  cseSpecificPrompts: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const chatbotConfigSchema = new Schema<IChatbotConfig>({
  name: {
    type: String,
    required: true,
    default: "CSE Student Assistant"
  },
  description: {
    type: String,
    required: true,
    default: "AI Assistant fine-tuned for Computer Science Engineering students"
  },
  systemPrompt: {
    type: String,
    required: true,
    default: `You are an AI assistant specifically designed to help Computer Science Engineering students. You have expertise in:
1. Programming languages (Python, Java, C++, JavaScript, etc.)
2. Data Structures and Algorithms
3. Computer Networks and Security
4. Database Management Systems
5. Operating Systems
6. Software Engineering
7. Artificial Intelligence and Machine Learning
8. Web Development and Cloud Computing
9. Academic guidance and project ideas
10. Career advice for CSE students

Provide detailed, practical advice with code examples when relevant. Focus on helping students understand concepts, solve problems, and excel in their studies.`
  },
  maxTokens: {
    type: Number,
    default: 2048
  },
  temperature: {
    type: Number,
    default: 0.7
  },
  topP: {
    type: Number,
    default: 0.9
  },
  topK: {
    type: Number,
    default: 40
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cseSpecificPrompts: [{
    type: String,
    default: [
      "Explain time complexity of algorithms",
      "Help with programming assignments",
      "Suggest project ideas for final year",
      "Explain database normalization",
      "Help debug code",
      "Explain OS concepts",
      "Guide for placement preparation",
      "Help with data structures",
      "Explain networking concepts",
      "Guide for competitive programming"
    ]
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin"
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const ChatbotConfig = mongoose.model<IChatbotConfig>("ChatbotConfig", chatbotConfigSchema);