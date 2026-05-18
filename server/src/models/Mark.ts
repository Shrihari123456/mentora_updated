import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const markSchema = new mongoose.Schema({
  sr: {
    type: String,
    default: null
  },
  usn: {
    type: String,
    default: null
  },
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