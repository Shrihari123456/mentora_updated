import mongoose, { Schema, Document, Types } from "mongoose";

interface ISibling {
  relationType: string;
  name: string;
  occupation: string;
  education: string;
}

interface IAchievement {
  domain: string;
  institution: string;
  activity: string;
  prizeDetails: string;
}

interface IParent {
  name: string;
  occupation: string;
  education: string;
  email: string;
  phone: string;
  permanentAddress: string;
  workAddress: string;
}

interface IMark {
  subject: string;
  cie1: number;
  cie2: number;
  cie3: number;
  semester?: number;
  isVerified?: boolean;
  verifiedBy?: mongoose.Types.ObjectId | null;
}

interface IEntranceExamRank {
  rank: string;
  examName: string;
}

interface ISemester {
  semester: number;
  subjects: IMark[];
}

interface IStudent extends Document {
  email: string;
  name: string;
  admissionYear: number;
  section: string;
  srNo: string;
  usn?: string;
  dob: Date;
  phone: string;
  studentEmail: string;
  aadharNumber: string;
  bloodGroup: string;
  photo: string;
  height: number;
  weight: number;
  residentType: string;
  permanentAddress: string;
  presentAddress: string;
  residentAddress: string;
  hostelWardenDetails?: string;
  localGuardianDetails?: string;
  hobbies: string[];
  entranceExamRank: IEntranceExamRank;
  familyIncomeStatus: string;
  father: IParent;
  mother: IParent;
  siblings: ISibling[];
  hasSiblings: boolean;
  previousCourse: string;
  mediumOfInstruction: string;
  previousInstitutionDetails: string;
  achievements: IAchievement[];
  mentor: Types.ObjectId;
  marks: IMark[];
  semesters: ISemester[];
  password: string;
  // New fields for appointment system
  appointments: Types.ObjectId[];
  isAvailableForMeeting: boolean;
  preferredMeetingTimes: string[];
}

const entranceExamRankSchema = new Schema<IEntranceExamRank>({
  rank: { type: String, required: true },
  examName: { type: String, required: true },
});

const siblingSchema = new Schema<ISibling>({
  relationType: { type: String, required: true },
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  education: { type: String, required: true },
});

const achievementSchema = new Schema<IAchievement>({
  domain: { type: String, required: true },
  institution: { type: String, required: true },
  activity: { type: String, required: true },
  prizeDetails: { type: String, required: true },
});

const parentSchema = new Schema<IParent>({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  education: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  workAddress: { type: String, required: true },
});

const SubjectMarksSchema = new Schema<IMark>({
  subject: { type: String, required: true },
  cie1: { type: Number, default: 0 },
  cie2: { type: Number, default: 0 },
  cie3: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
});

const SemesterSchema = new Schema<ISemester>({
  semester: { type: Number, required: true },
  subjects: [SubjectMarksSchema],
});

const studentSchema = new Schema<IStudent>({
  email: { type: String, required: true },
  name: { type: String, required: true },
  admissionYear: { type: Number, required: true },
  section: { type: String, required: true },
  srNo: { type: String, required: true },
  usn: { type: String },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  studentEmail: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  photo: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  residentType: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  presentAddress: { type: String, required: true },
  residentAddress: { type: String, required: true },
  hostelWardenDetails: { type: String },
  localGuardianDetails: { type: String },
  hobbies: { type: [String], default: [] },
  entranceExamRank: {
    type: entranceExamRankSchema,
    required: true,
  },
  familyIncomeStatus: { type: String, required: true },
  father: { type: parentSchema, required: true },
  mother: { type: parentSchema, required: true },
  siblings: { type: [siblingSchema], default: [] },
  hasSiblings: { type: Boolean, required: true },
  previousCourse: { type: String, required: true },
  mediumOfInstruction: { type: String, required: true },
  previousInstitutionDetails: { type: String, required: true },
  achievements: { type: [achievementSchema], default: [] },
  mentor: { type: Schema.Types.ObjectId, ref: "Mentor" },
  password: { type: String, required: true },
  semesters: [SemesterSchema],
  marks: [SemesterSchema],
  // New fields
  appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
  isAvailableForMeeting: { type: Boolean, default: true },
  preferredMeetingTimes: { type: [String], default: [] },
});

const convertDriveLinkToDirect = (driveLink: string) => {
  const regex = /(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const match = driveLink.match(regex);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
  } else {
    return driveLink;
  }
};

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hashedPassword = await Bun.password.hash(this.password);
  this.password = hashedPassword;
  this.photo = convertDriveLinkToDirect(this.photo);
  next();
});

const Student = mongoose.model<IStudent>("Student", studentSchema);
export default Student;