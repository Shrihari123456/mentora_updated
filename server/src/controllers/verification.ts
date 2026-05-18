import { Request, Response } from "express";
import VerificationRequest from "../models/verification";
// import Marks from "../models/Mark";
import Student from "../models/student";
import Mark from '../models/Mark';


// Custom interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

// Student creates a verification request
// controllers/verification.controller.ts
// import { Request, Response } from "express";



export const createVerificationRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sr, usn, semester, subjects, message } = req.body;

    console.log("✅ Received Payload:", { sr, usn, semester, subjects, message });

    // ✅ Validate: At least one of SR or USN is required
    const studentIdentifier = sr || usn;
    
    if (!studentIdentifier || !studentIdentifier.trim()) {
      res.status(400).json({
        error: "Either SR or USN is required",
        received: {
          sr: !!sr,
          usn: !!usn,
          semester: !!semester,
          subjects: !!subjects?.length,
          message: !!message
        }
      });
      return;
    }

    // ✅ Validate required fields
    if (!subjects?.length || !message?.trim()) {
      res.status(400).json({
        error: "Subjects and message are required (SR or USN required, semester optional)",
        received: {
          sr: !!sr,
          usn: !!usn,
          semester: !!semester,
          subjects: !!subjects?.length,
          message: !!message
        }
      });
      return;
    }

    const studentId = studentIdentifier.trim().toUpperCase();
    const isUSN = !!usn; // If usn was provided, treat as USN

    // ✅ Check if marks exist using SR or USN
    let markQuery: any = {};
    if (isUSN) {
      markQuery.usn = studentId;
    } else {
      markQuery.sr = studentId;
    }
    
    if (semester) {
      markQuery.semester = semester;
    }

    const markCheck = await Mark.findOne(markQuery);
    
    if (!markCheck) {
      console.log("❌ No marks found for:", studentId);
      res.status(404).json({ 
        error: `Student not found with ${isUSN ? 'USN' : 'SR'}: ${studentId}` 
      });
      return;
    }

    // ✅ Build marks query
    const marksQuery: any = {};
    if (isUSN) {
      marksQuery.usn = studentId;
    } else {
      marksQuery.sr = studentId;
    }
    
    if (semester) {
      marksQuery.semester = semester;
    }
    
    if (subjects && subjects.length > 0) {
      marksQuery.subject = { $in: subjects };
    }

    const marks = await Mark.find(marksQuery);

    // ✅ Check all subjects exist
    if (semester && marks.length !== subjects.length) {
      const foundSubjects = marks.map(m => m.subject);
      const missing = subjects.filter(sub => !foundSubjects.includes(sub));
      res.status(400).json({
        error: "Missing marks for subjects",
        missingSubjects: missing
      });
      return;
    }

    // ✅ Check for duplicate pending request
    const duplicateQuery: any = {
      subjects: { $all: subjects },
      status: 'pending'
    };
    
    if (isUSN) {
      duplicateQuery.usn = studentId;
    } else {
      duplicateQuery.sr = studentId;
    }
    
    if (semester) {
      duplicateQuery.semester = semester;
    }

    const existingRequest = await VerificationRequest.findOne(duplicateQuery);

    if (existingRequest) {
      res.status(409).json({
        error: "Duplicate request exists",
        requestId: existingRequest._id
      });
      return;
    }

    // ✅ Create verification request
    const requestData: any = {
      subjects,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date()
    };
    
    // Store the identifier used
    if (isUSN) {
      requestData.usn = studentId;
    } else {
      requestData.sr = studentId;
    }
    
    if (semester) {
      requestData.semester = semester;
    }

    const newRequest = await VerificationRequest.create(requestData);

    res.status(201).json({
      success: true,
      message: "Verification request submitted successfully",
      data: {
        _id: newRequest._id,
        sr: newRequest.sr || null,
        usn: newRequest.usn || null,
        semester: newRequest.semester || null,
        subjects: newRequest.subjects,
        message: newRequest.message,
        status: newRequest.status,
        createdAt: newRequest.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get student's own verification requests
export const getStudentVerificationRequests = async (
  req: AuthenticatedRequest, 
  res: Response
): Promise<void> => {
  try {
    const { usn } = req.params;

    const requests = await VerificationRequest.find({ usn })
      .populate('student', 'name usn')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Admin gets all verification requests
// controllers/verificationController.ts
// import { Request, Response } from 'express';
// import Marks from '../models/marks'; // Adjust as needed

// Admin gets all verification requests
export const getVerificationRequestsFromMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Build filter
    const filter: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      filter.status = status;
    }

    // Get total count
    const total = await VerificationRequest.countDocuments(filter);

    // Get paginated results
    const requests = await VerificationRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // ✅ FIXED: Correctly map the fields
    res.status(200).json({
      success: true,
      data: requests.map(request => ({
        _id: request._id,
        usn: request.usn || null,      // Keep USN if it exists
        sr: request.sr || null,        // Keep SR if it exists
        semester: request.semester,
        subjects: request.subjects,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt,
        processedAt: request.processedAt,
        adminFeedback: request.adminFeedback
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error("Error fetching verification requests:", error);
    res.status(500).json({ error: "Failed to fetch verification requests" });
  }
};



// Get single verification request details
// Get single verification request details
export const getVerificationRequestById = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await VerificationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    // ✅ Return both SR and USN if they exist
    res.status(200).json({ 
      success: true, 
      data: {
        _id: request._id,
        usn: request.usn || null,
        sr: request.sr || null,
        semester: request.semester,
        subjects: request.subjects,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt,
        processedAt: request.processedAt,
        adminFeedback: request.adminFeedback
      }
    });
  } catch (error) {
    console.error('Error fetching verification request by ID:', error);
    res.status(500).json({ error: 'Failed to fetch request details' });
  }
};


// Admin processes verification request
export const processVerificationRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { action, adminFeedback } = req.body;

    // Validate input
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ 
        error: "Invalid action",
        validActions: ['approved', 'rejected']
      });
    }

    if (!adminFeedback?.trim()) {
      return res.status(400).json({ 
        error: "Admin feedback is required"
      });
    }

    // Find and validate request
    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already ${request.status}`,
        currentStatus: request.status
      });
    }

    // Update request
    const updateData = {
      status: action,
      adminFeedback: adminFeedback.trim(),
      processedAt: new Date(),
      processedBy: req.user?.id // Track which admin processed it
    };

    const updatedRequest = await VerificationRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Request ${action} successfully`,
      data: {
        ...updatedRequest.toObject(),
        // Include any additional fields you want to return
      }
    });

  } catch (error) {
    console.error("Error processing verification request:", error);
    res.status(500).json({ 
      error: "Failed to process verification request",
      details: error instanceof Error ? error.message : undefined
    });
  }
};

// Get verification statistics
export const getVerificationStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await VerificationRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};
