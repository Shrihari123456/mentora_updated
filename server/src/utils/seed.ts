import Student from "../models/student";
import * as mongoose from "mongoose";

const stud1 = new Student({
  email: "ashikaursn01@gmail.com",
  name: "ASHIKA URS N",
  admissionYear: 2024,
  section: "U",
  srNo: "CA242711",
  usn: null,
  dob: new Date("2007-03-01"),
  phone: "9535676037",
  studentEmail: "ashikaursn01@gmail.com",
  aadharNumber: "258992230593",
  bloodGroup: "A +ve",
  photo: "https://drive.google.com/open?id=1ciqU0vx0nVJHiDmGW8cPpBR3OhycPrx6",
  height: 164,
  weight: 65,
  residentType: "Localite",
  permanentAddress: "#799,9th cross, Ramanuja road , Mysuru-570004",
  presentAddress: "#799,9th cross, Ramanuja road , Mysuru-570004",
  residentAddress: "Same as permanent address",

  hobbies: ["Singing", "Painting", "Drawing"],
  entranceExamRank: "2985",
  familyIncomeStatus: "Above Poverty Line (APL)",
  father: {
    name: "NATARAJA URS N",
    occupation: "Small business",
    education: "SSLC",
    email: "natarajurs.n@gmail.com",
    phone: "9738460128",
    permanentAddress: "#799, 9th cross , Ramanuja road , Mysuru -570004",
    workAddress: "#197,16th cross, 4th main, Vidyaranya puram",
  },
  mother: {
    name: "Poornima MS",
    occupation: "N/A",
    education: "MSc in psychology",
    email: "mysorepoornima.ms@gmail.com",
    phone: "9880692661",
    permanentAddress: "#799,9th cross, Ramanuja road , Mysuru-570004",
    workAddress: "N/A",
  },
  siblings: [],
  hasSiblings: false,
  previousCourse: "Pre-University(10+2) or Equivalent",
  mediumOfInstruction: "English",
  previousInstitutionDetails:
    "MMK nd SDM girls pu college , Krishnamurthy Puram , Mysuru",
  achievements: [],
});

const stud2 = new Student({
  email: "hg2087855@gmail.com",
  name: "HEMANTH GOWDA J",
  admissionYear: 2024,
  section: "U",
  srNo: "UU246020",
  usn: null,
  dob: new Date("2006-07-25"),
  phone: "9740156412",
  studentEmail: "hg2087855@gmail.com",
  aadharNumber: "522628932480",
  bloodGroup: "B +ve",
  photo: "https://drive.google.com/open?id=1sg93lZqdGL8JsXDRd8JXHbXn1b3ygJ8m",
  height: 187.96,
  weight: 81,
  residentType: "Localite",
  permanentAddress: "#1526/1 2nd cross soppinakeri mandi mohalla Mysore",
  presentAddress: "#1526/1 2nd cross mandi mohalla Mysore",
  residentAddress: "Same as permanent address",

  hobbies: ["Playing Sports"],
  entranceExamRank: "79632",
  familyIncomeStatus: "Below Poverty Line (BPL)",
  father: {
    name: "JAYARAM",
    occupation: "BUSINESS",
    education: "10th",
    email: "nomail@gmail.com",
    phone: "8197460078",
    permanentAddress: "#1526/1 2nd cross soppinakeri mandimohalla mysore",
    workAddress: "#1526/1 2nd cross soppinakeri mandimohalla mysore",
  },
  mother: {
    name: "Sheela k",
    occupation: "Housewife",
    education: "Bcom",
    email: "nomail@gmail.com",
    phone: "9740156412",
    permanentAddress: "#1526/1 2nd cross soppinakeri mandimohalla mysore",
    workAddress: "#1526/1 soppinakeri mandi mohalla Mysore",
  },
  siblings: [
    {
      relationType: "Brother",
      name: "HARISH GOWDA J",
      occupation: "Engineering",
      education: "Engineering",
    },
  ],
  hasSiblings: true,
  previousCourse: "Pre-University(10+2) or Equivalent",
  mediumOfInstruction: "English",
  previousInstitutionDetails: "SADVIDYA composite pu college",
  achievements: [
    {
      domain: "Sports Achievement",
      institution: "SADVIDYA",
      activity: "Playing chess",
      prizeDetails: "1st place in district level",
    },
  ],
});
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/test"
);

console.log("Connected to MongoDB...");
await stud1.save();
await stud2.save();
console.log("Students saved successfully!");
