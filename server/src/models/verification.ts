import mongoose, { Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // ✅ Add this

export interface IVerificationRequest extends Document {
  usn: string;
  semester?: number;
  subjects: string[];
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  student: mongoose.Types.ObjectId;
  adminFeedback?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationRequestSchema = new mongoose.Schema(
  {
    usn: String,
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

// ✅ Plug in pagination
verificationRequestSchema.plugin(mongoosePaginate);

const VerificationRequest = mongoose.model<IVerificationRequest, mongoose.PaginateModel<IVerificationRequest>>(
  'VerificationRequest',
  verificationRequestSchema
);

export default VerificationRequest;
