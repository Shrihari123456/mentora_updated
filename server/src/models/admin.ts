import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string; // Hashed
  department: string;
  role: "admin" | "hod";
}

const adminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, enum: ["admin", "hod"], default: "hod" }
});

const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;
