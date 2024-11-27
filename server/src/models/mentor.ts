import mongoose, { Schema, Document, Types } from "mongoose";
import { hash } from "bcrypt";

interface IMentor extends Document {
  name: string;
  empId: string;
  dept: string;
  designation: string;
  email: string;
  phone: string;
  students: Types.ObjectId[];
  password: string;
}

const mentorSchema: Schema = new Schema({
  name: { type: String, required: true },
  empId: { type: String, required: true },
  dept: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  password: { type: String, required: true },
});

mentorSchema.pre("save", async function (next) {
  const hashedPassword = await hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

const Mentor = mongoose.model<IMentor>("Mentor", mentorSchema);

export default Mentor;
