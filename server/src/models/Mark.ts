import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Request, Response } from 'express';

const markSchema = new mongoose.Schema({
  usn: String,
  semester: Number,
  subject: String,
  cie1: {
    type: Number,
    default: null
  },
  cie2: {
    type: Number,
    default: null
  },
  cie3: {
    type: Number,
    default: null
  },
  isVerifiedRequest: Boolean,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

markSchema.plugin(mongoosePaginate);

const Mark = mongoose.model('Mark', markSchema);
export default Mark;