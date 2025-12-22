import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import Student from '../src/models/student';
import path from 'path';
import fs from 'fs';

// MongoDB connection string - UPDATE WITH YOUR CREDENTIALS!
const MONGO_URI = 'mongodb+srv://tecraj19:q3QChRP5aACqAyEP@studentmentor.m3pen.mongodb.net/studMent?retryWrites=true&w=majority&appName=studentMentor';

interface ExcelRow {
  [key: string]: any;
  // Your Excel column names
  "Student's Name"?: string;
  "Students Name"?: string;
  "Student Name"?: string;
  "UserName"?: string;
  "Username"?: string;
  "Email"?: string;
  "SR No"?: string;
  "SR NO"?: string;
  "srNo"?: string;
  "Admission Year"?: number;
  "Section"?: string;
  "USN"?: string;
  "DOB"?: string | Date;
  "Date of Birth"?: string | Date;
  "Phone"?: string;
  "Phone Number"?: string;
  "Mobile"?: string;
  "Aadhar Number"?: string;
  "Aadhar"?: string;
  "Blood Group"?: string;
  "BloodGroup"?: string;
  "Height"?: number;
  "Weight"?: number;
  "Resident Type"?: string;
  "Permanent Address"?: string;
  "Present Address"?: string;
  "Resident Address"?: string;
  "Hobbies"?: string;
  "Family Income Status"?: string;
  "Family Income"?: string;
  // Add any other column names you have
}

async function importExcelToMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Read Excel file
    const excelFilePath = path.join(process.cwd(), 'students_data.xlsx');
    
    if (!fs.existsSync(excelFilePath)) {
      console.error('❌ Excel file not found at:', excelFilePath);
      console.log('📝 Please place your Excel file as "students_data.xlsx" in the server directory');
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${jsonData.length} records in Excel file`);
    
    // Show column names from first row (for debugging)
    if (jsonData.length > 0) {
      console.log('📋 Excel columns found:', Object.keys(jsonData[0]));
    }

    // Process each row
    let updatedCount = 0;
    let insertedCount = 0;
    let errorCount = 0;
    
    for (const [index, row] of jsonData.entries()) {
      try {
        // Get name from different possible column names
        const name = row["Student's Name"] || row["Students Name"] || row["Student Name"] || row.name || `Student ${index + 1}`;
        
        // Get email/username from different possible column names
        const userName = row["UserName"] || row["Username"] || row["Email"] || row.email || '';
        
        // Generate email if not provided
        const firstName = name.split(' ')[0].toLowerCase();
        const email = userName || `${firstName}@student.com`;
        const studentEmail = email;
        
        // Generate password from name (first name in lowercase)
        const password = firstName;

        // Generate unique default photo URL
        const defaultPhotoId = '1FiB3h0wL3Q7F6Dk8J9R2T4Y5U6I7O0P1A2S3D4F5G';
        const photoUrl = `https://drive.usercontent.google.com/download?id=${defaultPhotoId}&export=download`;

        // Get srNo from different possible column names
        const srNo = row.srNo || row["SR No"] || row["SR NO"] || `CA${String(index + 1).padStart(5, '0')}`;

        // Transform the data - MAPPING YOUR EXCEL COLUMNS
        const studentData: any = {
          email: email,
          name: name,
          studentEmail: studentEmail,
          admissionYear: row["Admission year"] || row.admissionYear || row.adminsionYear || 2024,
          section: row.Section || row.section || 'U',
          srNo: srNo,
          usn: row.USN || row.usn || null,
          dob: row.DOB || row["Date of Birth"] || row.dob ? new Date(row.DOB || row["Date of Birth"] || row.dob) : new Date('2000-01-01'),
          phone: row.Phone || row["Student's Phone"] || row.Mobile || row.phone || '0000000000',
          aadharNumber: row["Aadhar Number"] || row.Aadhar || row.aadharNumber || `9999${String(index).padStart(8, '0')}`,
          bloodGroup: row["Blood Group(Select the appropriate"] || row.BloodGroup || row.bloodGroup || 'O+',
          photo: photoUrl,
          height: row.Height || row.height || 165,
          weight: row.Weight || row.weight || 60,
          residentType: row["Resident Type"] || row.residentType || 'Localite',
          permanentAddress: row["Permanent Address"] || row.permanentAddress || 'Address not provided',
          presentAddress: row["Present Address"] || row.presentAddress || row.permanentAddress || 'Address not provided',
          residentAddress: row["Resident Address"] || row.residentAddress || 'Same as permanent address',
          password: password,
          hobbies: [],
          entranceExamRank: {
            rank: row["Entrance Rank"] || 'Not Available',
            examName: row["Exam Name"] || 'Entrance Exam'
          },
          familyIncomeStatus: row["Family Income Status"] || row["Family Income"] || row.familyIncomeStatus || 'Above Poverty Line (APL)',
          father: {
            name: row["Father Name"] || 'Not Provided',
            occupation: row["Father Occupation"] || 'Not Provided',
            education: row["Father Education"] || 'Not Provided',
            email: row["Father Email"] || 'notprovided@example.com',
            phone: row["Father Phone"] || '0000000000',
            permanentAddress: row["Father Address"] || 'Not Provided',
            workAddress: row["Father Work Address"] || 'Not Provided'
          },
          mother: {
            name: row["Mother Name"] || 'Not Provided',
            occupation: row["Mother Occupation"] || 'Not Provided',
            education: row["Mother Education"] || 'Not Provided',
            email: row["Mother Email"] || 'notprovided@example.com',
            phone: row["Mother Phone"] || '0000000000',
            permanentAddress: row["Mother Address"] || 'Not Provided',
            workAddress: row["Mother Work Address"] || 'Not Provided'
          },
          siblings: [],
          hasSiblings: false,
          previousCourse: row["Previous Course"] || 'Science',
          mediumOfInstruction: row["Medium"] || 'English',
          previousInstitutionDetails: row["Previous Institution"] || 'Local School',
          achievements: [],
          semesters: [],
          appointments: [],
          isAvailableForMeeting: true,
          preferredMeetingTimes: []
        };

        // Process hobbies
        if (row.Hobbies || row.hobbies) {
          const hobbiesStr = row.Hobbies || row.hobbies;
          if (typeof hobbiesStr === 'string') {
            studentData.hobbies = hobbiesStr.split(',').map((h: string) => h.trim());
          }
        }

        // Check if student exists
        const existingStudent = await Student.findOne({ srNo: studentData.srNo });
        
        if (existingStudent) {
          // UPDATE existing student - overwrite with correct data
          // Remove _id to avoid conflict
          const updateData = { ...studentData };
          delete updateData._id;
          
          await Student.findOneAndUpdate(
            { srNo: studentData.srNo },
            updateData,
            { 
              new: true,
              runValidators: true,
              setDefaultsOnInsert: true,
              overwrite: true // This will replace the entire document
            }
          );
          
          updatedCount++;
          console.log(`🔄 ${index + 1}/${jsonData.length}: UPDATED ${studentData.name} (${studentData.srNo})`);
          console.log(`   Email: ${studentData.email}`);
        } else {
          // INSERT new student
          const student = new Student(studentData);
          await student.save();
          insertedCount++;
          console.log(`✅ ${index + 1}/${jsonData.length}: INSERTED ${studentData.name} (${studentData.srNo})`);
          console.log(`   Email: ${studentData.email}`);
        }
        
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error on row ${index + 1}:`, error.message);
        console.log('Row data:', JSON.stringify(row, null, 2));
      }
    }

    console.log('\n📋 Import Summary:');
    console.log(`Total records in Excel: ${jsonData.length}`);
    console.log(`✅ Newly inserted: ${insertedCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (insertedCount > 0 || updatedCount > 0) {
      console.log('\n✅ Import completed successfully!');
      
      // Show final count
      const totalInDB = await Student.countDocuments();
      console.log(`📊 Total students in database now: ${totalInDB}`);
      
      // Show sample of imported data
      const sampleStudents = await Student.find().limit(3).select('name srNo email');
      console.log('\n📝 Sample imported students:');
      sampleStudents.forEach(s => console.log(`   - ${s.name} (${s.srNo}): ${s.email}`));
    } else {
      console.log('\n⚠️  No records were imported or updated.');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error: any) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  }
}

// Run the import function
importExcelToMongoDB();