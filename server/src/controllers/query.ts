import { Request, Response } from 'express';
import Student from '../models/student';
import Mentor from '../models/mentor';

// ─── Visualization detector ──────────────────────────────────────────────────

function determineVisualization(pipeline: any[]): {
  type: 'table' | 'bar' | 'pie' | 'line' | 'scatter';
  xField?: string;
  yField?: string;
  sizeField?: string;
  colorField?: string;
  explanation: string;
} {
  const groupStage  = pipeline.find(s => '$group'  in s);
  const sortStage   = pipeline.find(s => '$sort'   in s);
  const matchStage  = pipeline.find(s => '$match'  in s);
  const limitStage  = pipeline.find(s => '$limit'  in s);
  const lookupStage = pipeline.find(s => '$lookup' in s);

  // Cross-collection (lookup) → always table
  if (lookupStage) {
    return { type: 'table', explanation: 'Showing joined data from multiple collections' };
  }

  if (groupStage) {
    const groupKeys  = Object.keys(groupStage.$group);
    const nonIdKeys  = groupKeys.filter(k => k !== '_id');
    const idField    = groupStage.$group._id;
    const groupByField = typeof idField === 'string' ? idField.replace('$', '') : 'category';

    if (nonIdKeys.length > 0) {
      const aggField = nonIdKeys[0];
      const aggType  =
        groupStage.$group[aggField]?.$sum ? 'count'   :
        groupStage.$group[aggField]?.$avg ? 'average' :
        groupStage.$group[aggField]?.$max ? 'maximum' :
        groupStage.$group[aggField]?.$min ? 'minimum' : 'value';

      if (aggType === 'average' || aggType === 'count') {
        return { type: 'bar',  xField: '_id', yField: nonIdKeys[0], explanation: `${aggType} of ${aggField} grouped by ${groupByField}` };
      }
      return { type: 'line', xField: '_id', yField: nonIdKeys[0], explanation: `${aggType} grouped by ${groupByField}` };
    }

    return { type: 'pie', xField: '_id', yField: 'count', explanation: `Count grouped by ${groupByField}` };
  }

  if (sortStage) {
    const sortField = Object.keys(sortStage.$sort)[0];
    const dir = sortStage.$sort[sortField] === 1 ? 'ascending' : 'descending';
    if (limitStage) {
      return { type: 'bar', xField: 'name', yField: sortField, explanation: `Top ${limitStage.$limit} sorted by ${sortField} ${dir}` };
    }
    return { type: 'table', explanation: `Sorted by ${sortField} ${dir}` };
  }

  if (matchStage) {
    const fields = Object.keys(matchStage.$match);
    if (fields.some(f => ['height', 'weight', 'marks'].includes(f))) {
      return {
        type: 'scatter',
        xField: 'name',
        yField: fields.find(f => ['height', 'weight', 'marks'].includes(f)),
        sizeField: 'marks',
        explanation: `Filtered by ${fields.join(', ')}`
      };
    }
    return { type: 'table', explanation: `Filtered by ${fields.join(', ')}` };
  }

  return { type: 'table', explanation: 'Displaying data in table format' };
}

// ─── Main controller ─────────────────────────────────────────────────────────

export const processTextQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const apiKey = 'AIzaSyCoWsuWWURiT55UOzBnw0utyrnt0M-TmVQ';

    const prompt = `You are a MongoDB expert for a college mentorship system called Mentora.
You have access to TWO collections: "students" and "mentors".

STUDENT SCHEMA:
- name: String
- email: String
- srNo: String         (student's unique SR number, e.g. "CA24771")
- dob: Date
- height: Number
- weight: Number
- bloodGroup: String
- admissionYear: Number
- section: String
- marks: Number
- mentor: ObjectId     (references Mentor._id — ALWAYS use "mentor" NOT "mentorId" for $lookup)
- father: Object (name, occupation, email, phone)
- mother: Object (name, occupation, email, phone)
- siblings: Array
- achievements: Array

MENTOR SCHEMA:
- name: String
- email: String
- empId: String        (employee ID, e.g. "EMP001")
- dept: String
- section: String
- phone: String
- students: Array of ObjectId  (references Student._id)

RULES:
1. Return ONLY valid JSON with this structure:
{
  "collection": "students" | "mentors" | "students_with_mentor" | "mentors_with_students",
  "pipeline": [...],
  "explanation": "string"
}

2. collection field tells the system which model to run the pipeline on:
   - "students"              → run on Student model
   - "mentors"               → run on Mentor model  
   - "students_with_mentor"  → run on Student model (pipeline will have $lookup to mentors)
   - "mentors_with_students" → run on Mentor model (pipeline will have $lookup to students)

3. For cross-collection queries (e.g. "find mentor for student X", "students under mentor Y"):
   Use $lookup. Example for finding mentor of a student:
   [
     { "$match": { "name": "Ashika" } },
     { "$lookup": { "from": "mentors", "localField": "mentor", "foreignField": "_id", "as": "mentor" } },
     { "$unwind": { "path": "$mentor", "preserveNullAndEmptyArrays": true } },
     { "$project": { "_id": 0, "studentName": "$name", "srNo": 1, "section": 1, "mentorName": "$mentor.name", "mentorEmpId": "$mentor.empId", "mentorEmail": "$mentor.email" } }
   ]
   
   Example for finding students under a mentor:
   [
     { "$match": { "name": "John" } },
     { "$lookup": { "from": "students", "localField": "students", "foreignField": "_id", "as": "studentList" } },
     { "$unwind": "$studentList" },
     { "$replaceRoot": { "newRoot": { "$mergeObjects": ["$studentList", { "mentorName": "$name" }] } } }
   ]

4. For name/srNo search, use case-insensitive regex:
   { "$match": { "name": { "$regex": "ashika", "$options": "i" } } }

5. Never wrap in markdown or code blocks. Return raw JSON only.
6. For $unwind, ALWAYS use "preserveNullAndEmptyArrays" (NOT "preserveNullAndEmpty"). Example: { "$unwind": { "path": "$mentor", "preserveNullAndEmptyArrays": true } }
7. NEVER return _id or ObjectId fields. Always set "_id": 0 in $project.

8. Always flatten nested fields using aliases:
   Use "mentorName": "$mentor.name"  NOT  "mentor.name": 1
   Use "studentName": "$studentList.name"  NOT  "studentList.name": 1

EXAMPLES:
Q: "Who is the mentor of student Ashika?"
A: {"collection":"students_with_mentor","pipeline":[{"$match":{"name":{"$regex":"ashika","$options":"i"}}},{"$lookup":{"from":"mentors","localField":"mentorId","foreignField":"_id","as":"mentor"}},{"$unwind":{"path":"$mentor","preserveNullAndEmpty":true}},{"$project":{"name":1,"srNo":1,"section":1,"mentor.name":1,"mentor.empId":1,"mentor.email":1}}],"explanation":"Finds student Ashika and shows their assigned mentor details"}

Q: "List all mentors in department CSE"
A: {"collection":"mentors","pipeline":[{"$match":{"department":{"$regex":"CSE","$options":"i"}}}],"explanation":"Filters mentors belonging to the CSE department"}

Q: "Show students with height above 170"
A: {"collection":"students","pipeline":[{"$match":{"height":{"$gt":170}}}],"explanation":"Filters students whose height is greater than 170 cm"}

Q: "How many students does each mentor have?"
A: {"collection":"mentors","pipeline":[{"$project":{"name":1,"empId":1,"studentCount":{"$size":{"$ifNull":["$students",[]]}}}}],"explanation":"Shows each mentor with the count of students assigned to them"}

Now answer this query: "${query}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Gemini API error: ${errData.error?.message || 'Unknown'}`);
    }

    const geminiData = await response.json();
    const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) throw new Error('No response from Gemini');

    // Extract JSON from response
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd   = textResponse.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) throw new Error('Invalid response format from AI');

    const parsed = JSON.parse(textResponse.slice(jsonStart, jsonEnd));

    if (!parsed.pipeline || !Array.isArray(parsed.pipeline)) {
      throw new Error('Invalid pipeline in AI response');
    }

    const { collection, pipeline, explanation: aiExplanation } = parsed;

    // ── Run pipeline on the correct model ──────────────────────────────────
    let results: any[];

    switch (collection) {
      case 'mentors':
      case 'mentors_with_students':
        results = await Mentor.aggregate(pipeline);
        break;
      case 'students':
      case 'students_with_mentor':
      default:
        results = await Student.aggregate(pipeline);
        break;
    }

    // ── Determine visualization ────────────────────────────────────────────
    const viz = determineVisualization(pipeline);
    const fullExplanation = `${aiExplanation}. ${viz.explanation}`;

    res.json({
      success: true,
      data: results,
      pipeline,
      collection,
      visualization: {
        type: viz.type,
        xField: viz.xField,
        yField: viz.yField,
        sizeField: viz.sizeField,
        colorField: viz.colorField,
      },
      explanation: fullExplanation,
      chartTitle: `Results: ${query}`,
    });

  } catch (error: any) {
    console.error('Query processing error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
};