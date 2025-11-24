import mongoose, { Schema, Document, Types } from "mongoose";

interface IMentor extends Document {
  name: string;
  empId: string;
  dept: string;
  designation: string;
  email: string;
  phone: string;
  students: Types.ObjectId[];
  password: string;
  appointments: Types.ObjectId[];
  isAvailableForMeeting: boolean;
  availableHours: {
    start: string;
    end: string;
    days: string[];
  };
  meetingDuration: number;
  maxDailyAppointments: number;
}

const mentorSchema: Schema = new Schema<IMentor>({
  name: { type: String, required: true },
  empId: { type: String, required: true },
  dept: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  password: { type: String, required: true },
  appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
  isAvailableForMeeting: { type: Boolean, default: true },
  availableHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "17:00" },
    days: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
  },
  meetingDuration: { type: Number, default: 30 },
  maxDailyAppointments: { type: Number, default: 8 }
});

mentorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hashedPassword = await Bun.password.hash(this.password as string);
  this.password = hashedPassword;
  next();
});

const Mentor = mongoose.model<IMentor>("Mentor", mentorSchema);

export default Mentor;
