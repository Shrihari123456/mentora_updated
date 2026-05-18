import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Initialize Gemini with file support
const genAI = new GoogleGenerativeAI( 'AIzaSyCoWsuWWURiT55UOzBnw0utyrnt0M-TmVQ');
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// System prompt for CSE-focused assistant with PDF support
const CSE_SYSTEM_PROMPT = `You are "CodeMentor AI", an expert assistant for Computer Science Engineering students. You specialize in:

CORE COMPETENCIES:
1. Programming (Python, Java, C++, JavaScript, Go, Rust)
2. Data Structures & Algorithms (complexity analysis, optimization)
3. Databases (SQL, NoSQL, normalization, queries)
4. Computer Networks (protocols, security, architecture)
5. Operating Systems (process management, memory, file systems)
6. Software Engineering (design patterns, testing, DevOps)
7. AI/ML (basics, algorithms, applications)
8. Web Technologies (frontend/backend, frameworks, APIs)
9. Cloud Computing (AWS, Azure, GCP fundamentals)
10. Cybersecurity (basics, best practices)

PDF CONTEXT MODE:
When a student uploads a PDF (like lecture notes, research papers, textbooks, or assignments), you will have access to the PDF content. Please:
1. Read and understand the PDF content thoroughly
2. Answer questions specifically based on the uploaded PDF
3. Reference specific pages or sections when possible
4. Explain concepts from the PDF in simpler terms if needed
5. Provide additional context or examples beyond the PDF when helpful

RESPONSE GUIDELINES:
- Provide code examples with explanations
- Explain concepts step-by-step
- Suggest practical projects
- Give career advice for CSE fields
- Help debug with specific solutions
- Recommend learning resources
- Connect concepts to real-world applications
- Consider academic level (B.Tech CSE student)
-dont tell that i dont have access parae and give results

For coding questions, provide:
1. Problem analysis
2. Algorithm/pseudocode
3. Implementation in relevant language
4. Time/space complexity
5. Edge cases and testing

Always be encouraging, detailed, and practical.`;

// Send message to chatbot (with optional PDF context)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, pdfContext } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Check if we have PDF context from upload
    let pdfContent = '';
    if (pdfContext && pdfContext.text) {
      pdfContent = `
THE STUDENT HAS UPLOADED A PDF DOCUMENT. HERE IS THE EXTRACTED CONTENT:

${pdfContext.text}

Please answer questions based on this PDF content. Reference specific parts of the document when relevant.
`;
    }

    // Generate AI response
    const prompt = `
${CSE_SYSTEM_PROMPT}

${pdfContent}

Student Query: "${message}"

Please provide a helpful, detailed response focused on Computer Science Engineering education and practical guidance.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
        hasPdfContext: !!pdfContext
      }
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing chat message',
      error: error.message 
    });
  }
};

// Upload PDF and extract text
export const uploadPDF = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded' 
      });
    }

    const filePath = req.file.path;
    
    try {
      // For production, use a proper PDF text extraction library
      // For now, we'll create a mock extraction
      const mockExtractedText = `
PDF Uploaded Successfully!
File: ${req.file.originalname}
Size: ${(req.file.size / 1024).toFixed(2)} KB

Note: In production, use a PDF extraction library like pdf-parse or a service to extract text from PDFs.
For now, you can ask questions and I'll answer based on my CSE knowledge.

You can ask questions about:
1. Concepts in your uploaded PDF
2. Explain diagrams or formulas from the document
3. Clarify complex topics mentioned
4. Provide examples related to the content
      `;

      // Clean up the uploaded file after processing
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        data: {
          filename: req.file.originalname,
          text: mockExtractedText,
          message: 'PDF uploaded successfully. You can now ask questions about it.'
        }
      });

    } catch (error: any) {
      // Clean up file if there's an error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }

  } catch (error: any) {
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing PDF file',
      error: error.message 
    });
  }
};

// Get quick prompts for CSE
export const getQuickPrompts = async (req: Request, res: Response) => {
  try {
    const csePrompts = [
      "Explain binary search algorithm with Python code",
      "How to normalize a database to 3NF?",
      "Explain TCP/IP protocol stack",
      "Suggest a full-stack project idea",
      "Explain polymorphism in OOP with example",
      "How to optimize SQL queries?",
      "Explain Dijkstra's algorithm step by step",
      "What are design patterns in software engineering?",
      "Help me debug this Python code:",
      "Prepare me for technical interviews",
      "Explain REST API principles",
      "How does garbage collection work in Java?",
      "Suggest resources for learning machine learning",
      "Explain process synchronization in OS",
      "Help with recursion problems",
      "Upload a PDF and ask questions about it",
      "Explain concepts from my uploaded notes",
      "Help me understand this research paper"
    ];

    res.json({
      success: true,
      data: csePrompts
    });

  } catch (error: any) {
    console.error('Get prompts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching prompts' 
    });
  }
};