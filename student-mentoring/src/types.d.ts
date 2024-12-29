interface AuthPayload {
  role: "mentor" | "student";
  userid: string; // srNo or empId
  password: string;
}

interface EntranceExamRank {
  rank: number;
  examName: "CET" | "COMEDK" | "Diploma";
}

interface Student {
  name: string;
  srNo: string;
  email: string;
  admissionYear: number;
  photo: string;
  usn?: string;
  section: string;
  dob: string;
  phone: string;
  permanentAddress: string;
  presentAddress: string;
  entranceExamRank: EntranceExamRank | null;
  height: number;
  weight: number;
  bloodGroup: string;
  residentType: string;
  hostelWardenDetails?: string;
  localGuardianDetails?: string;
  father: {
    name: string;
    occupation: string;
    phone: string;
    workAddress: string;
    education: string;
    email: string;
    permanentAddress: string;
  };
  mother: {
    name: string;
    occupation: string;
    phone: string;
    workAddress: string;
    education: string;
    email: string;
    permanentAddress: string;
  };
  siblings: { relationType: string; name: string; occupation: string }[];
  achievements: {
    domain: string;
    activity: string;
    prizeDetails: string;
    institution: string;
  }[];
  previousCourse: string;
  mediumOfInstruction: string;
  previousInstitutionDetails: string;
  mentor: { name: string } | null;
}

interface Mentor {
  name: string;
  empId: string;
  dept: string;
  designation: string;
  email: string;
  phone: string;
  students: Student[];
  password: string;
}

type User = Student | Mentor;
