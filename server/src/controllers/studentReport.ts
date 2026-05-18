import Student from '../models/student';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCoWsuWWURiT55UOzBnw0utyrnt0M-TmVQ');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Function to parse natural language query to MongoDB filters
async function parseQueryToFilters(naturalLanguageQuery) {
  const prompt = `
    You are an AI assistant that converts natural language queries into MongoDB database queries.
    
    USER QUERY: "${naturalLanguageQuery}"
    
    TASK: Convert this query into a MongoDB query object that can search the student database.
    
    STUDENT DATABASE FIELDS:
    1. name (string) - student's full name
    2. section (string) - class section like "A", "B", "C"
    3. admissionYear (number) - year of admission like 2023, 2024
    4. bloodGroup (string) - blood groups stored as "O +ve", "A +ve", "B +ve", "AB +ve", "O -ve", "A -ve", "B -ve", "AB -ve"
    5. residentType (string) - "Hosteller", "Localite", "PG"
    6. permanentAddress (string) - hometown address
    7. presentAddress (string) - current address
    8. residentAddress (string) - accommodation address
    9. hobbies (array) - list of hobbies like ["cricket", "reading", "music"]
    10. height (number) - height in centimeters
    11. weight (number) - weight in kilograms
    12. usn (string) - university seat number
    13. srNo (string) - serial number
    14. previousCourse (string) - previous education like "Science", "Commerce", "Arts"
    15. mediumOfInstruction (string) - "English", "Kannada", "Hindi", etc.
    16. hasSiblings (boolean) - true/false
    
    IMPORTANT RULES:
    1. For location queries (like "vijayanagar", "bangalore", "mysore"), search in ALL address fields
    2. For section queries, match exact section letter (case-insensitive)
    3. For height/weight queries, use appropriate operators ($gt, $lt, $gte, $lte)
    4. For hobbies queries, ALWAYS use $elemMatch with $regex for case-insensitive partial matching. Never use $in.
    5. Use $regex with $options: "i" for case-insensitive text searches
    6. Combine multiple conditions with $and or $or as needed
    
    EXAMPLES:
    Query: "students in vijayanagar"
    Output: {"filters": {"$or": [{"permanentAddress": {"$regex": "vijayanagar", "$options": "i"}}, {"presentAddress": {"$regex": "vijayanagar", "$options": "i"}}, {"residentAddress": {"$regex": "vijayanagar", "$options": "i"}}]}, "explanation": "Searching for students with addresses containing 'vijayanagar'"}
    
    Query: "hostel students in section A"
    Output: {"filters": {"$and": [{"residentType": "Hosteller"}, {"section": "A"}]}, "explanation": "Searching for hostel students in section A"}
    
    Query: "students from 2023 batch"
    Output: {"filters": {"admissionYear": 2023}, "explanation": "Searching for students admitted in 2023"}
    
    Query: "students who play cricket"
    Output: {"filters": {"hobbies": {"$elemMatch": {"$regex": "cricket", "$options": "i"}}}, "explanation": "Searching for students who have cricket as a hobby"}
    
    Query: "students who like singing"
    Output: {"filters": {"hobbies": {"$elemMatch": {"$regex": "singing", "$options": "i"}}}, "explanation": "Searching for students who like singing"}
    
    Query: "students interested in photography"
    Output: {"filters": {"hobbies": {"$elemMatch": {"$regex": "photography", "$options": "i"}}}, "explanation": "Searching for students interested in photography"}
    
    Query: "tall students above 180cm"
    Output: {"filters": {"height": {"$gt": 180}}, "explanation": "Searching for students taller than 180cm"}
    
    Query: "science background students"
    Output: {"filters": {"previousCourse": {"$regex": "science", "$options": "i"}}, "explanation": "Searching for students with science background"}
    
    Query: "students in section A or B"
    Output: {"filters": {"$or": [{"section": "A"}, {"section": "B"}]}, "explanation": "Searching for students in section A or B"}
    Query: "students with O positive blood group"
Output: {"filters": {"bloodGroup": {"$regex": "O.*ve", "$options": "i"}}, "explanation": "Searching for students with O positive blood group"}

Query: "O+ blood group students"  
Output: {"filters": {"bloodGroup": {"$regex": "O.*\\+.*ve", "$options": "i"}}, "explanation": "Searching for students with O+ blood group"}
    
    Query: "day scholar students from bangalore"
    Output: {"filters": {"$and": [{"residentType": "Localite"}, {"$or": [{"permanentAddress": {"$regex": "bangalore", "$options": "i"}}, {"presentAddress": {"$regex": "bangalore", "$options": "i"}}, {"residentAddress": {"$regex": "bangalore", "$options": "i"}}]}]}, "explanation": "Searching for day scholar students from Bangalore"}
    
    Now convert this query: "${naturalLanguageQuery}"
    
    Return ONLY a valid JSON object in this exact format:
    {
      "filters": { MongoDB query object },
      "explanation": "Brief explanation of what the query is searching for"
    }
    
    DO NOT include any other text, explanations, or markdown. ONLY the JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Gemini raw response:', text);
    
    // Clean the response - remove any markdown or extra text
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '');
    cleanedText = cleanedText.replace(/```\s*/g, '');
    
    // Find the JSON object
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON found in response');
    }
    
    const jsonString = cleanedText.substring(jsonStart, jsonEnd);
    console.log('Extracted JSON:', jsonString);
    
    const parsed = JSON.parse(jsonString);
    
    // Ensure we have both filters and explanation
    if (!parsed.filters) {
      parsed.filters = {};
    }
    if (!parsed.explanation) {
      parsed.explanation = `Searching for students based on: ${naturalLanguageQuery}`;
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Error parsing query with AI:', error);
    
    // Intelligent fallback based on common query patterns
    const query = naturalLanguageQuery.toLowerCase();
    
    // Check for common patterns
    if (query.includes('hostel') || query.includes('hosteller')) {
      return {
        filters: { residentType: 'Hosteller' },
        explanation: 'Searching for hostel students'
      };
    } else if (query.includes('day scholar') || query.includes('day-scholar')) {
      return {
        filters: { residentType: 'Localite' },
        explanation: 'Searching for day scholar students'
      };
    } else if (query.includes('pg') || query.includes('paying guest')) {
      return {
        filters: { residentType: 'PG' },
        explanation: 'Searching for PG students'
      };
    } else if (query.match(/section\s+[a-z]/i)) {
      const sectionMatch = query.match(/section\s+([a-z])/i);
      if (sectionMatch) {
        const section = sectionMatch[1].toUpperCase();
        return {
          filters: { section: section },
          explanation: `Searching for students in section ${section}`
        };
      }
    } else if (query.match(/\d{4}\s+batch/) || query.includes('batch')) {
      const yearMatch = query.match(/(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        return {
          filters: { admissionYear: year },
          explanation: `Searching for students from ${year} batch`
        };
      }
    } else if (query.includes('blood') || query.includes('blood group')) {
      const bloodGroupMatch = query.match(/(o\+|o-|a\+|a-|b\+|b-|ab\+|ab-)/i);
      if (bloodGroupMatch) {
        const bloodGroup = bloodGroupMatch[0].toUpperCase();
        return {
          filters: { bloodGroup: bloodGroup },
          explanation: `Searching for students with ${bloodGroup} blood group`
        };
      }
    }
    
    // Default fallback - search in all address fields and name
    return {
      filters: {
        $or: [
          { permanentAddress: { $regex: naturalLanguageQuery, $options: 'i' } },
          { presentAddress: { $regex: naturalLanguageQuery, $options: 'i' } },
          { residentAddress: { $regex: naturalLanguageQuery, $options: 'i' } },
          { name: { $regex: naturalLanguageQuery, $options: 'i' } },
          { section: { $regex: naturalLanguageQuery, $options: 'i' } }
        ]
      },
      explanation: `Searching for students matching: ${naturalLanguageQuery}`
    };
  }
}

// Function to sanitize student data for privacy
function sanitizeStudentData(student) {
  // Create a new object from the student
  const sanitizedStudent = { ...student };
  
  // Remove sensitive information
  const sensitiveFields = [
    'aadharNumber', 'password',
    'father', 'mother', 'siblings', 'achievements', 'marks', 'semesters',
    'appointments', 'preferredMeetingTimes', 'isAvailableForMeeting',
    'familyIncomeStatus', 'entranceExamRank', 'previousInstitutionDetails',
    'localGuardianDetails', 'hostelWardenDetails',
    'height', 'weight', 'usn', 'srNo', 'admissionYear',
    'mediumOfInstruction', 'previousCourse', 'residentAddress',
    'permanentAddress', 'presentAddress', '__v'
  ];
  
  sensitiveFields.forEach(field => {
    delete sanitizedStudent[field];
  });
  
  // Handle mentor population
  if (sanitizedStudent.mentor && typeof sanitizedStudent.mentor === 'object') {
    sanitizedStudent.mentor = {
      _id: sanitizedStudent.mentor._id,
      name: sanitizedStudent.mentor.name || 'Mentor'
    };
  }
  
  // Format date
  if (sanitizedStudent.dob) {
    if (sanitizedStudent.dob instanceof Date) {
      sanitizedStudent.dob = sanitizedStudent.dob.toISOString().split('T')[0];
    } else if (typeof sanitizedStudent.dob === 'string') {
      sanitizedStudent.dob = sanitizedStudent.dob.split('T')[0];
    }
  }
  
  return sanitizedStudent;
}

export const studentSearch = async (req, res) => {
  try {
    const { query, studentId } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`Received search query: "${query}"`);
    
    // Parse query using Gemini AI
    const parsedQuery = await parseQueryToFilters(query);
    
    console.log('Parsed query:', parsedQuery);
    
    // Build query object
    let mongoQuery = { ...parsedQuery.filters };
    
    // Exclude the requesting student if studentId is provided
    if (studentId && studentId !== 'undefined') {
      mongoQuery._id = { $ne: studentId };
    }
    
    // Set a reasonable limit
    const limit = 100;
    
    console.log('Final MongoDB query:', JSON.stringify(mongoQuery, null, 2));
    
    // Execute search
    const students = await Student.find(mongoQuery)
      .limit(limit)
      .populate('mentor', 'name email')
      .lean()
      .exec();

    console.log(`Found ${students.length} students`);
    
    // Sanitize data for privacy
    const sanitizedStudents = students.map(student => sanitizeStudentData(student));
    
    // If no results found, try a broader search
    if (sanitizedStudents.length === 0) {
      console.log('No results found, trying broader search...');
      
      // Try searching just in addresses
      const broaderQuery = {
        $or: [
          { permanentAddress: { $regex: query, $options: 'i' } },
          { presentAddress: { $regex: query, $options: 'i' } },
          { residentAddress: { $regex: query, $options: 'i' } }
        ]
      };
      
      if (studentId && studentId !== 'undefined') {
        broaderQuery._id = { $ne: studentId };
      }
      
      const broaderResults = await Student.find(broaderQuery)
        .limit(limit)
        .populate('mentor', 'name')
        .lean()
        .exec();
      
      const broaderSanitized = broaderResults.map(student => sanitizeStudentData(student));
     
      
      if (broaderSanitized.length > 0) {
        return res.status(200).json({
          success: true,
          data: {
            students: broaderSanitized,
            count: broaderSanitized.length,
            explanation: `Found students in addresses matching: ${query}`,
            query: query,
            note: "Showing results from broader search"
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        students: sanitizedStudents,
        count: sanitizedStudents.length,
        explanation: parsedQuery.explanation,
        query: query
      }
    });

  } catch (error) {
    console.error('Error in student search:', error);
    
    // Try a simple search as last resort
    try {
      const simpleQuery = {
        $or: [
          { permanentAddress: { $regex: req.body.query || '', $options: 'i' } },
          { name: { $regex: req.body.query || '', $options: 'i' } }
        ]
      };
      
      const simpleResults = await Student.find(simpleQuery)
        .limit(20)
        .lean()
        .exec();
      
      const simpleSanitized = simpleResults.map(student => sanitizeStudentData(student));
      
      return res.status(200).json({
        success: true,
        data: {
          students: simpleSanitized,
          count: simpleSanitized.length,
          explanation: `Showing results for: ${req.body.query || 'all students'}`,
          query: req.body.query || '',
          note: "Using simple search due to AI error"
        }
      });
      
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        message: 'Error processing search query',
        error: error.message
      });
    }
  }
};