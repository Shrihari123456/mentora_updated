import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use your MongoDB URI
const MONGODB_URI = "mongodb+srv://tecraj19:q3QChRP5aACqAyEP@studentmentor.m3pen.mongodb.net/studMent?retryWrites=true&w=majority&appName=studentMentor";

interface FacultyMember {
  name: string;
  empId: string;
  designation: string;
  email: string;
  phone: string;
}

interface AvailableHours {
  start: string;
  end: string;
  days: string[];
}

interface IMentor {
  name: string;
  empId: string;
  dept: string;
  designation: string;
  email: string;
  phone: string;
  password: string;
  students: mongoose.Types.ObjectId[];
  appointments: mongoose.Types.ObjectId[];
  isAvailableForMeeting: boolean;
  availableHours: AvailableHours;
  meetingDuration: number;
  maxDailyAppointments: number;
}

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('✅ Connected to MongoDB: studMent database');
    console.log(`📁 Using collection: mentors`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Mentor Schema
const mentorSchema = new mongoose.Schema<IMentor>({
  name: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  dept: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  password: { type: String, required: true },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
  isAvailableForMeeting: { type: Boolean, default: true },
  availableHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "17:00" },
    days: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
  },
  meetingDuration: { type: Number, default: 30 },
  maxDailyAppointments: { type: Number, default: 8 }
});

// Password hashing middleware
mentorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    // Using Bun's password hashing
    const hashedPassword = await Bun.password.hash(this.password);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Mentor = mongoose.model<IMentor>("Mentor", mentorSchema);

// ALL 51 FACULTY MEMBERS FROM YOUR WORD DOCUMENT
const facultyData: FacultyMember[] = [
  { name: "Dr. Srinath S", empId: "566", designation: "Head of the Dept.", email: "srinath@sjce.ac.in", phone: "9844823201" },
  { name: "Dr. Pushpalatha M P", empId: "381", designation: "Professor", email: "mppvin@sjce.ac.in", phone: "9141410120" },
  { name: "Dr. Anil Kumar K M", empId: "494", designation: "Professor", email: "anilkm@sjce.ac.in", phone: "9945633380" },
  { name: "Dr. Anusuya M A", empId: "426", designation: "Professor", email: "anusuya_ma@sjce.ac.in", phone: "9945914227" },
  { name: "Dr. Ramakrishna Hegde", empId: "1045", designation: "Professor", email: "rvhegde@jssstuniv.in", phone: "8762057972" },
  { name: "Dr. Rekha K S", empId: "1046", designation: "Professor", email: "rekhaks@jssstuniv.in", phone: "9880713707" },
  { name: "Dr. Prasanna B T", empId: "725", designation: "Assoc. Prof.", email: "prasannabt@jssstuniv.in", phone: "9611933400" },
  { name: "Dr. Manimala S", empId: "427", designation: "Assoc. Prof.", email: "manimala@sjce.ac.in", phone: "9449812005" },
  { name: "Dr. Trisiladevi C Nagavi", empId: "431", designation: "Assoc. Prof.", email: "trisiladevi@sjce.ac.in", phone: "9481530261" },
  { name: "Dr. Mahesha P", empId: "400", designation: "Assoc. Prof.", email: "maheshap@sjce.ac.in", phone: "9448600494" },
  { name: "Dr. Vani Ashok", empId: "495", designation: "Assoc. Prof.", email: "vanisj@sjce.ac.in", phone: "8073341214" },
  { name: "Dr. Guru R", empId: "568", designation: "Assoc. Prof.", email: "guruirg@sjce.ac.in", phone: "9945207635" },
  { name: "Dr. Chandrashekar A M", empId: "375", designation: "Assoc. Prof.", email: "amc@sjce.ac.in", phone: "9242351725" },
  { name: "Dr. Sheela N", empId: "493", designation: "Assoc. Prof.", email: "sheela_cse@sjce.ac.in", phone: "9480191406" },
  { name: "Dr. Chethan B K", empId: "1042", designation: "Assoc. Prof.", email: "chethanbk@jssstuniv.in", phone: "9980300880" },
  { name: "Dr. Madhusudhan G", empId: "496", designation: "Asst. Prof.", email: "madhusudan@sjce.ac.in", phone: "9916115101" },
  { name: "Prof. Brunda S", empId: "501", designation: "Asst. Prof.", email: "sbrunda@sjce.ac.in", phone: "7846922848" },
  { name: "Dr. Manjula S", empId: "462", designation: "Asst. Prof.", email: "thejasyashas@sjce.ac.in", phone: "9164338398" },
  { name: "Prof. Divakara N", empId: "407", designation: "Asst. Prof.", email: "dna@sjce.ac.in", phone: "9945583473" },
  { name: "Prof. Vijay M B", empId: "592", designation: "Asst. Prof.", email: "mbv@sjce.ac.in", phone: "9886956789" },
  { name: "Prof. Nandeesh H D", empId: "1507", designation: "Asst. Prof.", email: "hdnandeesh@sjce.ac.in", phone: "9538349705" },
  { name: "Prof. Shalini K C", empId: "720", designation: "Asst. Prof.", email: "shalini.kc@sjce.ac.in", phone: "9538586562" },
  { name: "Prof. Ashritha R Murthy", empId: "721", designation: "Asst. Prof.", email: "ashrithar.murthy@sjce.ac.in", phone: "9901223371" },
  { name: "Prof. Bindiya A R", empId: "722", designation: "Asst. Prof.", email: "bindiyaramesh@sjce.ac.in", phone: "8884360874" },
  { name: "Prof. Varsha V", empId: "723", designation: "Asst. Prof.", email: "varsha.v@sjce.ac.in", phone: "9739227108" },
  { name: "Prof. Shruthi N M", empId: "724", designation: "Asst. Prof.", email: "shruthinm@sjce.ac.in", phone: "8073145917" },
  { name: "Prof. Swetha P M", empId: "792", designation: "Asst. Prof.", email: "swetha@sjce.ac.in", phone: "9742903742" },
  { name: "Dr. Parashiva Murthy B M", empId: "813", designation: "Asst. Prof.", email: "parashivamurthy@sjce.ac.in", phone: "9448181850" },
  { name: "Prof. Shwethashree G C", empId: "893", designation: "Asst. Prof.", email: "shwethashree@jssstuniv.in", phone: "8553158040" },
  { name: "Prof. Rakshitha R", empId: "908", designation: "Asst. Prof.", email: "rakshitha.r@jssstuniv.in", phone: "9743007435" },
  { name: "Prof. Kendagannawamy M S", empId: "688", designation: "Asst. Prof.", email: "kswamy@jssstuniv.in", phone: "8453313725" },
  { name: "Prof. Aishwarya D S", empId: "912", designation: "Asst. Prof.", email: "aishwaryads@jssstuniv.in", phone: "9972922830" },
  { name: "Prof. Shruthi B M", empId: "941", designation: "Asst. Prof.", email: "shruthibm@jssstuniv.in", phone: "7795581319" },
  { name: "Prof. Raksha R", empId: "986", designation: "Asst. Prof.", email: "raksha@jssstuniv.in", phone: "7838344223" },
  { name: "Prof. Shwetha G N", empId: "987", designation: "Asst. Prof.", email: "shwethagn@jssstuniv.in", phone: "9743187778" },
  { name: "Prof. Divya H N", empId: "988", designation: "Asst. Prof.", email: "divyahn@jssstuniv.in", phone: "9880531846" },
  { name: "Prof. Vaishnavi", empId: "989", designation: "Asst. Prof.", email: "vaishnavi@jssstuniv.in", phone: "9916347897" },
  { name: "Dr. Suhas S", empId: "994", designation: "Asst. Prof.", email: "suhas@jssstuniv.in", phone: "9480379939" },
  { name: "Prof. Ramya S", empId: "995", designation: "Asst. Prof.", email: "ramyas@jssstuniv.in", phone: "9535105095" },
  { name: "Prof. Rakshith P", empId: "917", designation: "Asst. Prof.", email: "rakshith@jssstuniv.in", phone: "7624990536" },
  { name: "Prof. Shwetha S", empId: "990", designation: "Asst. Prof.", email: "shwethas@jssstuniv.in", phone: "7975944249" },
  { name: "Prof. Shruthi N", empId: "991", designation: "Asst. Prof.", email: "nshruthi@jssstuniv.in", phone: "8880578887" },
  { name: "Prof. Amaresh A M", empId: "997", designation: "Asst. Prof.", email: "amaresham@jssstuniv.in", phone: "8105051753" },
  { name: "Dr. Priyanka D", empId: "1001", designation: "Asst. Prof.", email: "priyankad@jssstuniv.in", phone: "8861663301" },
  { name: "Prof. Yashaswini N", empId: "1010", designation: "Asst. Prof.", email: "yashaswini@jssstuniv.in", phone: "9036569400" },
  { name: "Prof. Priyanka V H", empId: "1014", designation: "Asst. Prof.", email: "priyankavh@jssstuniv.in", phone: "8095008175" },
  { name: "Prof. Shruthi D", empId: "1021", designation: "Asst. Prof.", email: "shruthid@jssstuniv.in", phone: "9480632132" },
  { name: "Prof. Mahesh K S", empId: "596", designation: "Asst. Prof.", email: "ksmcse@sjce.ac.in", phone: "9448800805" },
  { name: "Prof. Pooja J N", empId: "1025", designation: "Asst. Prof.", email: "poojajn@jssstuniv.in", phone: "9738544378" },
  { name: "Prof. Savitha N", empId: "1026", designation: "Asst. Prof.", email: "savithan@jssstuniv.in", phone: "9535696784" },
  { name: "Dr. Sunitha Patel M S", empId: "1048", designation: "Asst. Prof.", email: "sunithapatel@jssstuniv.in", phone: "9946041490" }
];

const addFacultyToMentors = async (): Promise<void> => {
  try {
    console.log('🚀 Starting mentor insertion script...\n');
    await connectDB();
    
    // Check existing mentors
    const existingMentors = await Mentor.find({}, 'name empId email');
    console.log(`📊 Found ${existingMentors.length} existing mentors in the database:`);
    
    if (existingMentors.length > 0) {
      console.log('\nExisting mentors (these will NOT be touched):');
      existingMentors.forEach((mentor, index) => {
        console.log(`   ${index + 1}. ${mentor.name} (${mentor.empId}) - ${mentor.email}`);
      });
    } else {
      console.log('   No existing mentors found.');
    }
    
    // Get existing empIds
    const existingEmpIds = existingMentors.map(mentor => mentor.empId);
    const existingEmpIdSet = new Set(existingEmpIds);
    
    // Filter out faculty that already exist
    const newFaculty = facultyData.filter(
      faculty => !existingEmpIdSet.has(faculty.empId)
    );
    
    console.log(`\n📋 From Word document: ${facultyData.length} faculty members`);
    console.log(`📝 To be added: ${newFaculty.length} new mentors`);
    
    if (newFaculty.length === 0) {
      console.log('\n✅ All faculty members already exist in the mentors table.');
      console.log('   No new mentors to add.');
      return;
    }
    
    console.log('\nNew mentors to be added:');
    newFaculty.forEach((faculty, index) => {
      console.log(`   ${index + 1}. ${faculty.name} (${faculty.empId}) - ${faculty.designation}`);
    });
    
    // Prepare mentor documents with all required fields
    const mentorsToInsert: IMentor[] = newFaculty.map(faculty => ({
      name: faculty.name,
      empId: faculty.empId,
      dept: "Computer Science",
      designation: faculty.designation,
      email: faculty.email,
      phone: faculty.phone,
      password: "password", // Default password
      students: [],
      appointments: [],
      isAvailableForMeeting: true,
      availableHours: {
        start: "09:00",
        end: "17:00",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      },
      meetingDuration: 30,
      maxDailyAppointments: 8
    }));
    
    // Insert new mentors
    console.log('\n⏳ Inserting new mentors into mentors table...');
    const result = await Mentor.insertMany(mentorsToInsert);
    
    console.log(`\n✅ SUCCESS! Added ${result.length} new mentors:`);
    result.forEach((mentor, index) => {
      console.log(`   ${index + 1}. ${mentor.name} (Employee ID: ${mentor.empId})`);
    });
    
    // Print login instructions
    console.log('\n🔑 --- LOGIN CREDENTIALS FOR NEW MENTORS ---');
    console.log('   Employee ID: Use the Employee ID shown above');
    console.log('   Password: "password" (for all new mentors)');
    console.log('   URL: Your application login page');
    console.log('   Note: Mentors should change password after first login\n');
    
    // Final statistics
    const finalCount = await Mentor.countDocuments();
    console.log('📈 DATABASE STATISTICS:');
    console.log(`   Existing mentors kept: ${existingMentors.length}`);
    console.log(`   New mentors added: ${result.length}`);
    console.log(`   Total mentors now: ${finalCount}`);
    
    // Keep existing mentors like MNT001, MNT002 safe
    console.log('\n✅ Existing mentors (like MNT001, MNT002) are preserved.');
    console.log('✅ Only new faculty from Word document were added.');
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      if ((error as any).code === 11000) {
        console.error('   Duplicate key error - some empIds already exist');
      }
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB connection closed');
    console.log('✨ Script completed');
  }
};

// Run the script
addFacultyToMentors();