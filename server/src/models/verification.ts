import mongoose, { Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IVerificationRequest extends Document {
  usn?: string;        // ← optional now
  sr?: string;         // ← add this
  semester?: number;
  subjects: string[];
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  student?: mongoose.Types.ObjectId; // ← optional since SR students won't have this
  adminFeedback?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationRequestSchema = new mongoose.Schema(
  {
    usn: { type: String, default: null },   // ← was just String
    sr:  { type: String, default: null },   // ← ADD THIS
    semester: Number,
    subjects: [String],
    message: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    adminFeedback: String,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    processedAt: Date
  },
  { timestamps: true }
);

verificationRequestSchema.plugin(mongoosePaginate);

const VerificationRequest = mongoose.model<IVerificationRequest, mongoose.PaginateModel<IVerificationRequest>>(
  'VerificationRequest',
  verificationRequestSchema
);

export default VerificationRequest;