import { Document, Schema, Model, model, Types } from 'mongoose';

interface IFeedback {
  rating: number;
  comments: string;
  submittedBy: 'student' | 'mentor';
}

interface IAppointment extends Document {
  student: Types.ObjectId;
  mentor: Types.ObjectId;
  scheduledDate: Date;
  scheduledTime: string;
  endTime: string;
  purpose: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'no-show' |'started'
  meetingStatus: 'scheduled' | 'approved' | 'active' | 'ended' | 'cancelled' | 'rejected'| 'started';
  meetingLink?: string;
  roomId?: string;
  meetingRoomId?: string;
  duration: number;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
  reminderSent: boolean;
  actualStartTime?: Date;
  actualEndTime?: Date;
  feedback?: IFeedback;
  startedAt: Date;
 endedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String, maxlength: 500 },
  submittedBy: { type: String, enum: ['student', 'mentor'] as const }
});

const appointmentSchema = new Schema<IAppointment>({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  mentor: { 
    type: Schema.Types.ObjectId, 
    ref: "Mentor", 
    required: true 
  },
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  scheduledTime: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  endTime: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  description: { 
    type: String,
    maxlength: 1000
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'no-show'] as const,
    default: 'pending'
  },
  meetingStatus: {
    type: String,
    enum: ['scheduled', 'approved', 'active', 'ended', 'cancelled', 'rejected'] as const,
    default: 'scheduled'
  },
  meetingLink: { 
    type: String 
  },
  roomId: { 
    type: String 
  },
  meetingRoomId: {
    type: String
  },
  duration: { 
    type: Number, 
    required: true,
    min: 15,
    max: 120
  },
  rejectionReason: { 
    type: String,
    maxlength: 300
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'] as const,
    default: 'medium'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  actualStartTime: { 
    type: Date 
  },
  actualEndTime: { 
    type: Date 
  },
  feedback: feedbackSchema
}, {
  timestamps: true
});

// Type for the pre-save hook
type AppointmentThis = IAppointment & Document<any, any, IAppointment>;

// Generate unique room ID and meeting link when appointment is approved
appointmentSchema.pre<AppointmentThis>('save', function(next) {
  if (this.status === 'approved' && !this.roomId) {
    const roomId = `mentor-${this.mentor}-student-${this.student}-${Date.now()}`;
    this.roomId = roomId;
    this.meetingRoomId = roomId;
    this.meetingLink = `https://meet.jit.si/${roomId}`;
  }
  next();
});

// Calculate end time based on duration
appointmentSchema.pre<AppointmentThis>('save', function(next) {
  if (this.isModified('scheduledTime') || this.isModified('duration')) {
    const [hours, minutes] = this.scheduledTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    this.endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }
  next();
});

// Indexes for efficient querying
appointmentSchema.index({ student: 1, scheduledDate: 1 });
appointmentSchema.index({ mentor: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledDate: 1, scheduledTime: 1 });
appointmentSchema.index({ meetingStatus: 1 });

const Appointment: Model<IAppointment> = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
export { IAppointment, IFeedback };