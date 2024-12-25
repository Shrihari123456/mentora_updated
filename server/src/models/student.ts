import mongoose, { Schema, Document, Types } from "mongoose";
/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - admissionYear
 *         - section
 *         - srNo
 *         - dob
 *         - phone
 *         - studentEmail
 *         - aadharNumber
 *         - bloodGroup
 *         - photo
 *         - height
 *         - weight
 *         - residentType
 *         - permanentAddress
 *         - presentAddress
 *         - residentAddress
 *         - entranceExamRank
 *         - familyIncomeStatus
 *         - father
 *         - mother
 *         - hasSiblings
 *         - previousCourse
 *         - mediumOfInstruction
 *         - previousInstitutionDetails
 *       properties:
 *         email:
 *           type: string
 *           description: The student's email
 *         name:
 *           type: string
 *           description: The student's name
 *         admissionYear:
 *           type: number
 *           description: The year of admission
 *         section:
 *           type: string
 *           description: The section of the student
 *         srNo:
 *           type: string
 *           description: The student's serial number
 *         usn:
 *           type: string
 *           description: The student's university serial number
 *         dob:
 *           type: string
 *           format: date
 *           description: The student's date of birth
 *         phone:
 *           type: string
 *           description: The student's phone number
 *         studentEmail:
 *           type: string
 *           description: The student's email
 *         aadharNumber:
 *           type: string
 *           description: The student's Aadhar number
 *         bloodGroup:
 *           type: string
 *           description: The student's blood group
 *         photo:
 *           type: string
 *           description: The student's photo URL
 *         height:
 *           type: number
 *           description: The student's height
 *         weight:
 *           type: number
 *           description: The student's weight
 *         residentType:
 *           type: string
 *           description: The student's resident type
 *         permanentAddress:
 *           type: string
 *           description: The student's permanent address
 *         presentAddress:
 *           type: string
 *           description: The student's present address
 *         residentAddress:
 *           type: string
 *           description: The student's resident address
 *         entranceExamRank:
 *           type: string
 *           description: The student's entrance exam rank
 *         familyIncomeStatus:
 *           type: string
 *           description: The student's family income status
 *         father:
 *           $ref: '#/components/schemas/Parent'
 *         mother:
 *           $ref: '#/components/schemas/Parent'
 *         siblings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Sibling'
 *         hasSiblings:
 *           type: boolean
 *           description: Whether the student has siblings
 *         previousCourse:
 *           type: string
 *           description: The student's previous course
 *         mediumOfInstruction:
 *           type: string
 *           description: The student's medium of instruction
 *         previousInstitutionDetails:
 *           type: string
 *           description: The student's previous institution details
 *         achievements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Achievement'
 *     Parent:
 *       type: object
 *       required:
 *         - name
 *         - occupation
 *         - education
 *         - email
 *         - phone
 *         - permanentAddress
 *         - workAddress
 *       properties:
 *         name:
 *           type: string
 *           description: The parent's name
 *         occupation:
 *           type: string
 *           description: The parent's occupation
 *         education:
 *           type: string
 *           description: The parent's education
 *         email:
 *           type: string
 *           description: The parent's email
 *         phone:
 *           type: string
 *           description: The parent's phone number
 *         permanentAddress:
 *           type: string
 *           description: The parent's permanent address
 *         workAddress:
 *           type: string
 *           description: The parent's work address
 *     Sibling:
 *       type: object
 *       required:
 *         - relationType
 *         - name
 *         - occupation
 *         - education
 *       properties:
 *         relationType:
 *           type: string
 *           description: The sibling's relation type
 *         name:
 *           type: string
 *           description: The sibling's name
 *         occupation:
 *           type: string
 *           description: The sibling's occupation
 *         education:
 *           type: string
 *           description: The sibling's education
 *     Achievement:
 *       type: object
 *       required:
 *         - domain
 *         - institution
 *         - activity
 *         - prizeDetails
 *       properties:
 *         domain:
 *           type: string
 *           description: The achievement's domain
 *         institution:
 *           type: string
 *           description: The institution where the achievement was obtained
 *         activity:
 *           type: string
 *           description: The activity for which the achievement was obtained
 *         prizeDetails:
 *           type: string
 *           description: The details of the prize
 */

// Interface for sibling details
interface ISibling {
  relationType: string;
  name: string;
  occupation: string;
  education: string;
}

// Interface for achievement details
interface IAchievement {
  domain: string;
  institution: string;
  activity: string;
  prizeDetails: string;
}

// Interface for parent details
interface IParent {
  name: string;
  occupation: string;
  education: string;
  email: string;
  phone: string;
  permanentAddress: string;
  workAddress: string;
}

interface IEntranceExamRank {
  rank: string;
  examName: string;
}

// Interface for the main student document
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
  password: string;
}

const entranceExamRankSchema = new Schema<IEntranceExamRank>({
  rank: { type: String, required: true },
  examName: { type: String, required: true },
});

// Sibling schema
const siblingSchema = new Schema<ISibling>({
  relationType: { type: String, required: true },
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  education: { type: String, required: true },
});

// Achievement schema
const achievementSchema = new Schema<IAchievement>({
  domain: { type: String, required: true },
  institution: { type: String, required: true },
  activity: { type: String, required: true },
  prizeDetails: { type: String, required: true },
});

// Parent schema
const parentSchema = new Schema<IParent>({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  education: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  workAddress: { type: String, required: true },
});

// Main student schema
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

// Hash the password before saving
studentSchema.pre("save", async function (next) {
  const hashedPassword = await Bun.password.hash(this.password);
  this.password = hashedPassword;
  this.photo = convertDriveLinkToDirect(this.photo);
  next();
});

const Student = mongoose.model<IStudent>("Student", studentSchema);

export default Student;
