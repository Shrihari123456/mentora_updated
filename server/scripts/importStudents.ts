import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import Student from '../src/models/student';
import path from 'path';
import fs from 'fs';

const MONGO_URI = 'mongodb+srv://tecraj19:q3QChRP5aACqAyEP@studentmentor.m3pen.mongodb.net/studMent?retryWrites=true&w=majority&appName=studentMentor';

async function importExcelToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const excelFilePath = path.join(process.cwd(), 'students_data.xlsx');

    if (!fs.existsSync(excelFilePath)) {
      console.error('❌ Excel file not found at:', excelFilePath);
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${jsonData.length} records in Excel file`);

    let updatedCount = 0;
    let insertedCount = 0;
    let errorCount = 0;

    for (const [index, row] of jsonData.entries()) {
      try {
        const name = row["Student's Name"] || `Student ${index + 1}`;
        const email = row["Student's Email-id"] || row["Username"] || '';
        const firstName = name.split(' ')[0].toLowerCase();
        const password = firstName;

        // Extract Google Drive photo URL
        const rawPhoto = row["Students passport size photograph (Please give Latest Photograph)"] || '';
        let photoUrl = '';
        const driveMatch = rawPhoto.match(/id=([a-zA-Z0-9_-]+)/);
        if (driveMatch) {
          photoUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
        } else {
          photoUrl = `https://drive.usercontent.google.com/download?id=1FiB3h0wL3Q7F6Dk8J9R2T4Y5U6I7O0P1A2S3D4F5G&export=download`;
        }

        const srNo = row["SR No"] || `CA${String(index + 1).padStart(5, '0')}`;

        const studentData: any = {
          email,
          name,
          studentEmail: email,
          admissionYear: parseInt(String(row["Admission year"] || '2024').split('-')[0]) || 2024,
          section: row["Section (Enter your first year section)"] || 'U',
          srNo,
          usn: row["USN (Please skip it if you haven't received it)"] || null,
          dob: row["Student's DOB (Date of Birth)"]
            ? new Date(row["Student's DOB (Date of Birth)"])
            : new Date('2000-01-01'),
          phone: String(row["Student's Phone/Mobile number"] || '0000000000'),
          aadharNumber: String(row["Student's Aadhar Number (Aadhaar number should be of 12 digits)"] || `9999${String(index).padStart(8, '0')}`),
          bloodGroup: row["Blood Group (Select the appropriate)"] || 'O+',
          photo: photoUrl,
          height: row["Height (In cm)"] || 165,
          weight: row["Weight (In Kg)"] || 60,
          residentType: row["Type of resident"] || 'Localite',
          permanentAddress: row["Permanent Address"] || 'Address not provided',
          presentAddress: row["Present Address"] || row["Permanent Address"] || 'Address not provided',
          residentAddress: row["Resident Address"] || 'Same as permanent address',
          password,
          hobbies: row["Hobbies (You can choose more than one hobbies)"]
            ? String(row["Hobbies (You can choose more than one hobbies)"]).split(',').map((h: string) => h.trim())
            : [],
          entranceExamRank: {
            rank: String(row["KCET/COMEDK/Diploma CET Ranking"] || 'Not Available'),
            examName: 'KCET/COMEDK/Diploma CET',
          },
          familyIncomeStatus: row["Family's Income Status"] || 'Above Poverty Line (APL)',
          father: {
            name: row["Father's Name"] || 'Not Provided',
            occupation: row["Father's Occupation (Please Enter N/A if not applicable)"] || 'Not Provided',
            education: row["Father's Education"] || 'Not Provided',
            email: row["Father's Email Address"] || 'notprovided@example.com',
            phone: String(row["Father's Contact No (Mobile number is Preferable)"] || '0000000000'),
            permanentAddress: row["Father's Permanent Address"] || 'Not Provided',
            workAddress: row["Father's Work Address"] || 'Not Provided',
          },
          mother: {
            name: row["Mother's Name"] || 'Not Provided',
            occupation: row["Mother's Occupation  (Please Enter N/A if not applicable)"] || 'Not Provided',
            education: row["Mother's Education"] || 'Not Provided',
            email: row["Mother's Email Address"] || 'notprovided@example.com',
            phone: String(row["Mother's Phone No (Mobile number is Preferable)"] || '0000000000'),
            permanentAddress: row["Mother's Permanent Address"] || 'Not Provided',
            workAddress: row["Mother's Work Address (Please Enter N/A if not applicable)"] || 'Not Provided',
          },
          siblings: [],
          hasSiblings: false,
          achievements: [],
          semesters: [],
          appointments: [],
          isAvailableForMeeting: true,
          preferredMeetingTimes: [],
          previousCourse: row["Previous course completed"] || 'Science',
          mediumOfInstruction: row["Medium of Instruction (Medium in which you had studied)"] || 'English',
          previousInstitutionDetails: row["Name and Address of Previous Institution"] || 'Local School',
        };

        const existingStudent = await Student.findOne({ srNo: studentData.srNo });

        if (existingStudent) {
          const updateData = { ...studentData };
          delete updateData._id;
          await Student.findOneAndUpdate(
            { srNo: studentData.srNo },
            updateData,
            { new: true, runValidators: true, setDefaultsOnInsert: true, overwrite: true }
          );
          updatedCount++;
          console.log(`🔄 ${index + 1}/${jsonData.length}: UPDATED ${studentData.name} (${studentData.srNo})`);
        } else {
          const student = new Student(studentData);
          await student.save();
          insertedCount++;
          console.log(`✅ ${index + 1}/${jsonData.length}: INSERTED ${studentData.name} (${studentData.srNo})`);
        }

      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error on row ${index + 1}:`, error.message);
      }
    }

    console.log('\n📋 Import Summary:');
    console.log(`Total records in Excel: ${jsonData.length}`);
    console.log(`✅ Newly inserted: ${insertedCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    const totalInDB = await Student.countDocuments();
    console.log(`📊 Total students in database now: ${totalInDB}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  }
}

importExcelToMongoDB();