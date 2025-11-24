import { Request,RequestHandler, Response,NextFunction } from "express";
// import Student from "../models/student";
// import { IMark } from "../models/student";
import Student from "../models/student";
// Get all students
export const getStudents = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const students = await Student.find().populate("mentor", "name");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get a single student by ID
export const getStudentById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "mentor",
      "name"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

//fetch by srNo
export const getStudentBySrNo = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const student = await Student.findOne({ srNo: req.params.srNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error: unknown) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// fetch by usn
export const getStudentByUsn = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const student = await Student.findOne({ usn: req.params.usn });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

//get all unassigned students
export const getUnassignedStudents = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const admissionYear = req.query.admissionYear as string | undefined;
    const section = req.query.section as string | undefined;
    if (admissionYear && section) {
      const students = await Student.find({
        mentor: null,
        admissionYear: admissionYear,
        section: section,
      });
      console.log(students);
      if (students.length === 0) {
        return res
          .status(404)
          .json({ message: "No unassigned students found" });
      }
      return res.status(200).json(students);
    } else if (admissionYear) {
      const students = await Student.find({
        mentor: { $exists: false },
        admissionYear,
      });
      if (students.length === 0) {
        return res
          .status(404)
          .json({ message: "No unassigned students found" });
      }
      return res.status(200).json(students);
    } else {
      const students = await Student.find({ mentor: { $exists: false } });
      if (students.length === 0) {
        return res
          .status(404)
          .json({ message: "No unassigned students found" });
      }
      return res.status(200).json(students);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create a new student
export const createStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Update a student by ID
export const updateStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateStudentBySrNo = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { srNo: req.params.srNo },
      req.body,
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a student by ID
export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// login student
export const loginStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const student = await Student.findOne({ srNo: req.body.srNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const isMatch = await Bun.password.verify(
      req.body.password,
      student.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// update student password

export const updateStudentPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const isMatch = await Bun.password.verify(
      req.body.oldPassword,
      student.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    student.password = req.body.newPassword;
    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
// controllers/studentController.ts


// Temporary in-memory store (replace with DB logic later)
const semesterMarksStore: any[] = [];
// export const getMarksByUsn = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { usn, semester } = req.query;

//     if (!usn) {
//       return res.status(400).json({ message: "USN parameter is required" });
//     }

//     const student = await Student.findOne({ usn: usn.toString() });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     if (semester) {
//       const semesterNumber = parseInt(semester as string);
//       if (isNaN(semesterNumber)) {
//         return res.status(400).json({ message: "Invalid semester value" });
//       }

//       const semesterData = student.semesters.find(s => s.semester === semesterNumber);
//       if (!semesterData) {
//         return res.status(404).json({ message: `No marks found for semester ${semester}` });
//       }

//       return res.status(200).json({
//         usn: student.usn,
//         name: student.name,
//         semester: semesterData.semester,
//         subjects: semesterData.subjects
//       });
//     }

//     res.status(200).json({
//       usn: student.usn,
//       name: student.name,
//       semesters: student.semesters
//     });
//   } catch (error) {
//     res.status(500).json({ message: (error as Error).message });
//   }
// };
export const addStudentMarks: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { semesterData } = req.body;

    // Validate payload
    if (
      !semesterData ||
      typeof semesterData.semester !== "number" ||
      !Array.isArray(semesterData.subjects)
    ) {
      res.status(400).json({ message: "Invalid data format. Semester and subjects required." });
      return;
    }

    if (semesterData.semester < 1 || semesterData.semester > 8) {
      res.status(400).json({ message: "Semester must be between 1 and 8" });
      return;
    }

    // Validate each subject's marks
    for (const subject of semesterData.subjects) {
      if (!subject.subject || typeof subject.subject !== 'string') {
        res.status(400).json({ message: "Each subject must have a valid name" });
        return;
      }

      for (const cie of ['cie1', 'cie2', 'cie3']) {
        if (
          subject[cie] !== undefined &&
          (typeof subject[cie] !== "number" || subject[cie] < 0 || subject[cie] > 100)
        ) {
          res.status(400).json({
            message: `CIE marks must be between 0 and 100 (invalid ${cie} for ${subject.subject})`,
          });
          return;
        }
      }
    }

    // Store in memory (or database)
    semesterMarksStore.push({
      semester: semesterData.semester,
      subjects: semesterData.subjects,
      createdAt: new Date(),
    });

    console.log(`Marks added for semester ${semesterData.semester}`);

    res.status(200).json({
      message: "Marks added successfully",
      semester: semesterData.semester,
      subjects: semesterData.subjects,
    });
  } catch (error) {
    console.error("addStudentMarks error:", error);
    next(error);
  }
};


export const getStudentMarks = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // If semester is specified, return only that semester's data
    if (semester) {
      const semesterData = student.semesters.find(
        (sem: any) => sem.semester === parseInt(semester as string)
      );
      
      if (!semesterData) {
        return res.status(404).json({ message: `No data found for semester ${semester}` });
      }
      
      return res.status(200).json({
        studentId: student._id,
        name: student.name,
        semesterData
      });
    }
    
    // Otherwise return all semesters
    res.status(200).json({
      studentId: student._id,
      name: student.name,
      semesters: student.semesters
    });
    
  } catch (error) {
    console.error(error);
    // res.status(500).json({ message: "Server error", error: error.message });
  }
};

