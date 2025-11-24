import { Request, Response, NextFunction } from 'express';
// import Mark from '../models/Mark';
import Mark from '../models/Mark';

interface BulkUploadRequest {
  semester: number;
  records: {
    usn: string;
    subject: string;
    cie1: number; 
    cie2: number;
    cie3: number;
  }[];
  adminId?: string; // Optional admin identifier
}

interface SingleCandidateUploadRequest {
  usn: string;
  semester: number;
  subjects: {
    subject: string;
    cie1: number;
    cie2: number;
    cie3: number;
  }[];
  adminId?: string; // Optional admin identifier
}

// Original bulk upload for multiple candidates
export const bulkUploadMarks = async (
  req: Request, 
  res: Response, 
  next?: NextFunction
): Promise<void> => {
  try {
    const { semester, records, adminId }: BulkUploadRequest = req.body;

    // Simple validation
    if (!semester || semester < 1 || semester > 8) {
      res.status(400).json({ message: "Invalid semester (must be 1-8)" });
      return;
    }

    if (!records?.length) {
      res.status(400).json({ message: "No records provided" });
      return;
    }

    // Validate records format
    const invalidRecords = records.filter(record => 
      !record.usn || 
      !record.subject || 
      typeof record.cie1 !== 'number' || record.cie1 < 0 || record.cie1 > 30 ||
      typeof record.cie2 !== 'number' || record.cie2 < 0 || record.cie2 > 30 ||
      typeof record.cie3 !== 'number' || record.cie3 < 0 || record.cie3 > 30
    );

    if (invalidRecords.length > 0) {
      res.status(400).json({ 
        message: `${invalidRecords.length} invalid records found. Check USN, Subject, and CIE marks (0-30).` 
      });
      return;
    }

    const results = {
      total: records.length,
      success: 0,
      duplicates: 0,
      errors: [] as string[],
      uploadedAt: new Date().toISOString()
    };

    // Process all records
    await Promise.all(records.map(async (record) => {
      try {
        await Mark.create({
          ...record,
          semester,
          uploadedBy: adminId || 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        results.success++;
      } catch (error: any) {
        if (error.code === 11000) {
          results.duplicates++;
          results.errors.push(`Duplicate: ${record.usn} - ${record.subject}`);
        } else {
          results.errors.push(`Error with ${record.usn}: ${error.message}`);
        }
      }
    }));

    res.status(200).json({
      message: `Processed ${results.success} of ${results.total} records successfully`,
      success: true,
      data: results
    });

  } catch (error: any) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// New function for uploading marks for single candidate with multiple subjects
export const uploadCandidateMarks = async (
  req: Request, 
  res: Response, 
  next?: NextFunction
): Promise<void> => {
  try {
    const { usn, semester, subjects, adminId }: SingleCandidateUploadRequest = req.body;

    // Validation
    if (!usn || typeof usn !== 'string') {
      res.status(400).json({ message: "Valid USN is required" });
      return;
    }

    if (!semester || semester < 1 || semester > 8) {
      res.status(400).json({ message: "Invalid semester (must be 1-8)" });
      return;
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ message: "At least one subject is required" });
      return;
    }

    // Validate each subject
    const invalidSubjects = subjects.filter(subject => 
      !subject.subject || 
      typeof subject.cie1 !== 'number' || subject.cie1 < 0 || subject.cie1 > 30 ||
      typeof subject.cie2 !== 'number' || subject.cie2 < 0 || subject.cie2 > 30 ||
      typeof subject.cie3 !== 'number' || subject.cie3 < 0 || subject.cie3 > 30
    );

    if (invalidSubjects.length > 0) {
      res.status(400).json({ 
        message: `${invalidSubjects.length} invalid subjects found. Check Subject name and CIE marks (0-30).`,
        invalidSubjects: invalidSubjects.map(s => s.subject || 'Unknown subject')
      });
      return;
    }

    const studentUsn = usn.toString().toUpperCase();
    
    const results = {
      usn: studentUsn,
      semester,
      total: subjects.length,
      success: 0,
      duplicates: 0,
      updated: 0,
      errors: [] as string[],
      uploadedAt: new Date().toISOString()
    };

    // Process each subject for the candidate
    for (const subjectData of subjects) {
      try {
        // Check if record already exists
        const existingMark = await Mark.findOne({
          usn: studentUsn,
          semester,
          subject: subjectData.subject
        });

        if (existingMark) {
          // Update existing record
          await Mark.updateOne(
            { usn: studentUsn, semester, subject: subjectData.subject },
            {
              cie1: subjectData.cie1,
              cie2: subjectData.cie2,
              cie3: subjectData.cie3,
              uploadedBy: adminId || 'admin',
              updatedAt: new Date()
            }
          );
          results.updated++;
        } else {
          // Create new record
          await Mark.create({
            usn: studentUsn,
            semester,
            subject: subjectData.subject,
            cie1: subjectData.cie1,
            cie2: subjectData.cie2,
            cie3: subjectData.cie3,
            uploadedBy: adminId || 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          results.success++;
        }
      } catch (error: any) {
        console.error(`Error processing subject ${subjectData.subject}:`, error);
        results.errors.push(`Error with subject ${subjectData.subject}: ${error.message}`);
      }
    }

    // Prepare response message
    let message = '';
    if (results.success > 0 && results.updated > 0) {
      message = `Successfully created ${results.success} and updated ${results.updated} subject records for USN ${studentUsn}`;
    } else if (results.success > 0) {
      message = `Successfully created ${results.success} subject records for USN ${studentUsn}`;
    } else if (results.updated > 0) {
      message = `Successfully updated ${results.updated} subject records for USN ${studentUsn}`;
    } else {
      message = `No records were processed for USN ${studentUsn}`;
    }

    const statusCode = (results.success > 0 || results.updated > 0) ? 200 : 400;

    res.status(statusCode).json({
      message,
      success: statusCode === 200,
      data: results
    });

  } catch (error: any) {
    console.error('Candidate marks upload error:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};



export const getMarksByUsn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usn, semester } = req.query;

    if (!usn) {
      res.status(400).json({ message: "USN parameter is required" });
      return;
    }

    // Convert USN to uppercase for consistency
    const studentUsn = usn.toString().toUpperCase();

    // Build query object
    const query: any = { usn: studentUsn };
        
    // Add semester filter if provided
    if (semester) {
      const semesterNumber = parseInt(semester as string);
      if (isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
        res.status(400).json({ message: "Invalid semester value (must be 1-8)" });
        return;
      }
      query.semester = semesterNumber;
    }

    // Fetch marks from Mark collection
    const marks = await Mark.find(query).sort({ semester: 1, subject: 1 });

    if (!marks || marks.length === 0) {
      res.status(404).json({
        message: semester
          ? `No marks found for USN ${studentUsn} in semester ${semester}`
          : `No marks found for USN ${studentUsn}`
      });
      return;
    }

    // If specific semester requested, return flat structure
    if (semester) {
      const subjects = marks.map(mark => ({
        subject: mark.subject,
        cie1: mark.cie1,
        cie2: mark.cie2,
        cie3: mark.cie3
      }));

      res.status(200).json({
        usn: studentUsn,
        semester: parseInt(semester as string),
        subjects: subjects
      });
      return;
    }

    // If no semester specified, group by semester
   const semesterGroups = marks.reduce((acc, mark) => {
  // Ensure semester is a defined number
  const semesterKey = mark.semester;
  if (typeof semesterKey !== 'number') {
    return acc; // skip invalid entries
  }

  if (!acc[semesterKey]) {
    acc[semesterKey] = [];
  }
  
  acc[semesterKey].push({
    subject: mark.subject,
    cie1: mark.cie1,
    cie2: mark.cie2,
    cie3: mark.cie3
  });
  
  return acc;
}, {} as Record<number, any[]>);

    // Convert to array format
    const semesters = Object.keys(semesterGroups).map(sem => ({
      semester: parseInt(sem),
      subjects: semesterGroups[parseInt(sem)]
    })).sort((a, b) => a.semester - b.semester);

    res.status(200).json({
      usn: studentUsn,
      semesters: semesters
    });

  } catch (error) {
    console.error('Error fetching marks by USN:', error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
    });
  }
};