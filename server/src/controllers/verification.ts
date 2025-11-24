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
    const { usn, semester, subjects, message } = req.body;

    console.log("✅ Received Payload:", { usn, semester, subjects, message });

    if (!usn?.trim() || !semester || !subjects?.length || !message?.trim()) {
      res.status(400).json({
        error: "All fields are required",
        received: {
          usn: !!usn,
          semester: !!semester,
          subjects: !!subjects?.length,
          message: !!message
        }
      });
      return;
    }

    const usnTrimmed = usn.trim().toUpperCase();

    // ✅ Check if marks exist for that USN to confirm student exists
    const markCheck = await Mark.findOne({ usn: usnTrimmed });
    if (!markCheck) {
      console.log("❌ No marks found — student does not exist in Marks schema");
      res.status(404).json({ error: "Student not found (in marks database)" });
      return;
    }

    // ✅ Now fetch marks for the selected subjects
    const marks = await Mark.find({
      usn: usnTrimmed,
      semester,
      subject: { $in: subjects }
    });

    console.log(`📚 Found ${marks.length} marks for subjects:`, subjects);

    if (marks.length !== subjects.length) {
      const missing = subjects.filter(sub => !marks.some(m => m.subject === sub));
      res.status(400).json({
        error: "Missing marks for subjects",
        missingSubjects: missing
      });
      return;
    }

    // ✅ Prevent duplicate pending request
    const existingRequest = await VerificationRequest.findOne({
      usn: usnTrimmed,
      semester,
      subjects: { $all: subjects },
      status: 'pending'
    });

    if (existingRequest) {
      console.log("⚠️ Duplicate verification request already exists:", existingRequest._id);
      res.status(409).json({
        error: "Duplicate request exists",
        requestId: existingRequest._id
      });
      return;
    }

    // ✅ Create new verification request (student field removed)
    const newRequest = await VerificationRequest.create({
      usn: usnTrimmed,
      semester,
      subjects,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date()
    });

    console.log("✅ Verification request created:", newRequest._id);

    res.status(201).json({
      success: true,
      message: "Verification request submitted successfully",
      data: {
        _id: newRequest._id,
        usn: newRequest.usn,
        semester: newRequest.semester,
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

// In your verification controller
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

    res.status(200).json({
      success: true,
      data: requests.map(request => ({
        _id: request._id,
        usn: request.usn, // Ensure USN is included
        message: request.message, // Ensure message is included
        status: request.status,
        subjects: request.subjects,
        semester: request.semester,
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
export const getVerificationRequestById = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await VerificationRequest.findById(requestId)
      .populate('student', 'usn name email');

    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    res.status(200).json({ success: true, data: request });
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
