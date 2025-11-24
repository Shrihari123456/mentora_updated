'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SubjectMark {
  subject: string;
  cie1: number;
  cie2: number;
  cie3: number;
}

interface PerformanceAnalysis {
  aggregatePercentage: number;
  category: 'weak' | 'average' | 'strong';
  categoryStatement: string;
  recommendations: string[];
  improvementAreas: string[];
  confidenceScore: number;
  subjectAnalysis: {
    subject: string;
    status: 'needs_improvement' | 'satisfactory' | 'excellent';
    feedback: string;
    roadmap?: {
      overallGoal: string;
      weeklyTasks: {
        week: number;
        focusArea: string;
        tasks: string[];
      }[];
    };
  }[];
  nextTestStudyPlan: string[];
}

interface VerificationRequest {
  _id?: string;
  usn: string;
  semester?: number;
  subjects: string[];
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  createdAt?: Date;
  processedAt?: Date;
  student?: {
    name?: string;
    email?: string;
  };
}

const SubjectProgressChart = ({ marks }: { marks: { cie1: number; cie2: number; cie3: number } }) => {
  const data = [
    { name: 'CIE 1', marks: marks.cie1 },
    { name: 'CIE 2', marks: marks.cie2 },
    { name: 'CIE 3', marks: marks.cie3 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 30]} />
          <Tooltip 
            formatter={(value) => [`${value}`, 'Marks']}
            labelFormatter={(label) => `${label} Score`}
          />
          <Line 
            type="monotone" 
            dataKey="marks" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function StudentMarksPage() {
  const router = useRouter();
  const [usn, setUsn] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState({
    fetch: false,
    analysis: false,
    verification: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [marksData, setMarksData] = useState<{
    usn: string;
    semester?: number;
    subjects?: SubjectMark[];
    semesters?: {
      semester: number;
      subjects: SubjectMark[];
    }[];
  } | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'fetch' | 'analysis' | 'verification'>('fetch');
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

const fetchMarksByUSN = async () => {
  if (!usn.trim()) {
    setError('Please enter your USN');
    return;
  }

  setLoading({ ...loading, fetch: true });
  setError(null);
  setSuccess(null);
  setMarksData(null); // Reset previous data

  try {
    const params = new URLSearchParams();
    // Append the USN exactly as entered (no case conversion)
    params.append('usn', usn.trim());
    
    if (semester && semester.trim()) {
      params.append('semester', semester.trim());
    }

    console.log('Making request to:', `http://localhost:8000/api/marks/markbyusn?${params.toString()}`);

    const response = await fetch(`http://localhost:8000/api/marks/markbyusn?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('route hit');
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch marks');
    }

    if (!data || (!data.subjects && !data.semesters)) {
      throw new Error('No marks found for this USN');
    }

    setMarksData(data);
    setSuccess(semester ? 
      `Found marks for USN: ${usn} - Semester ${semester}` :
      `Found marks for USN: ${usn} - All semesters`
    );
    setActiveTab('analysis');
  } catch (err: any) {
    console.error('Fetch error:', err);
    setError(err.message || 'An error occurred while fetching marks');
  } finally {
    setLoading({ ...loading, fetch: false });
  }
};

  const analyzePerformance = async () => {
    if (!marksData) return;

    setLoading({ ...loading, analysis: true });
    setError(null);
    
    try {
      let subjectsToAnalyze: SubjectMark[] = [];
      
      if (marksData.subjects) {
        subjectsToAnalyze = marksData.subjects;
      } else if (marksData.semesters) {
        const latestSemester = marksData.semesters.reduce((latest, current) => 
          current.semester > latest.semester ? current : latest
        );
        subjectsToAnalyze = latestSemester.subjects;
      }

      const validSubjects = subjectsToAnalyze.filter(sub => sub.subject.trim() !== '');
      
      if (validSubjects.length === 0) {
        throw new Error('No valid subjects to analyze');
      }

      const apiKey = 'AIzaSyDUBuH3noHWfxRULKaT4A9_C-q-OLMEf4o';
      if (!apiKey) {
        throw new Error('AI analysis service is currently unavailable');
      }

      const prompt = `
Analyze the following student marks and provide a detailed performance assessment.
First calculate the aggregate percentage across all subjects (average of all CIE marks).
Marks are out of 30.

CATEGORIZATION RULES:
- If aggregate is below 50%: categorize as "weak"
- If aggregate is 50-75%: categorize as "average" 
- If aggregate is above 75%: categorize as "strong"

Then provide:
1. The calculated aggregate percentage
2. Clear statement: "This student is performing at [weak/average/strong] level"
3. Specific recommendations for improvement based on the category
4. Key areas needing attention
5. Confidence score (0-100)
6. Per-subject analysis with:
   - Status (needs_improvement/satisfactory/excellent)
   - Feedback
   - For weak subjects (marks < 15/30), include:
     * 1-month roadmap with 4 weekly tasks
     * Each week should focus on different aspects:
       Week 1: Fundamental concepts
       Week 2: Practice problems
       Week 3: Mock tests
       Week 4: Revision and weak areas
7. Overall study plan for next test
8. Next test study plan with actionable tasks

FORMAT YOUR RESPONSE AS VALID JSON:
{
  "aggregatePercentage": number,
  "category": "weak|average|strong",
  "categoryStatement": "string",
  "recommendations": ["string"],
  "improvementAreas": ["string"],
  "confidenceScore": number,
  "subjectAnalysis": [{
    "subject": "string",
    "status": "needs_improvement|satisfactory|excellent",
    "feedback": "string",
    "roadmap": {
      "overallGoal": "string",
      "weeklyTasks": [
        {
          "week": 1,
          "focusArea": "string",
          "tasks": ["string"]
        },
        {
          "week": 2,
          "focusArea": "string",
          "tasks": ["string"]
        },
        {
          "week": 3,
          "focusArea": "string",
          "tasks": ["string"]
        },
        {
          "week": 4,
          "focusArea": "string",
          "tasks": ["string"]
        }
      ]
    }
  }],
  "nextTestStudyPlan": ["string"]
}

MARKS DATA TO ANALYZE:
${JSON.stringify(validSubjects, null, 2)}

IMPORTANT: 
- Only return valid JSON that can be parsed with JSON.parse()
- Do not include any markdown formatting or additional text
- Marks are out of 30
- For subjects needing improvement, provide detailed weekly tasks
- Make tasks specific and actionable
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI analysis failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error('No valid response from AI analysis');
      }

      const jsonStart = textResponse.indexOf('{');
      const jsonEnd = textResponse.lastIndexOf('}') + 1;
      const jsonString = textResponse.slice(jsonStart, jsonEnd);
      
      const analysisResult: PerformanceAnalysis = JSON.parse(jsonString);
      setAnalysis(analysisResult);
      setSuccess('Performance analysis completed successfully');
    } catch (err: any) {
      setError(`Analysis Error: ${err.message}`);
    } finally {
      setLoading({ ...loading, analysis: false });
    }
  };

  const initiateVerification = () => {
    if (!marksData) return;
    
    const currentSubjects = getCurrentSubjects();
    setVerificationRequest({
      usn: usn,
      semester: marksData.semester,
      subjects: currentSubjects.map(sub => sub.subject),
      message: '',
      status: 'pending'
    });
    setShowVerificationForm(true);
  };
  
const submitVerificationRequest = async () => {
  if (!verificationMessage.trim()) {
    setError('Please enter a reason for verification');
    return;
  }

  setLoading({ ...loading, verification: true });
  setError(null);

  try {
    const currentSubjects = getCurrentSubjects(); // Must return array of { subject: string }
    const subjectNames = currentSubjects.map(sub => sub.subject);

    const response = await fetch('http://localhost:8000/api/verification/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // ✅ Required
      },
      body: JSON.stringify({
        usn: usn.trim().toUpperCase(),         // Normalize USN
        semester: marksData?.semester,
        subjects: subjectNames,
        message: verificationMessage.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to submit verification request');
    }

    setVerificationRequest({
      usn: usn.trim().toUpperCase(),
      semester: marksData?.semester,
      subjects: subjectNames,
      message: verificationMessage.trim(),
      status: 'pending',
      ...data.data
    });

    setSuccess(data.message || 'Verification request submitted successfully!');
    setShowVerificationForm(false);
    setVerificationMessage('');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading({ ...loading, verification: false });
  }
};


const fetchVerificationRequests = async () => {
  if (!usn) return;

  setLoading({ ...loading, verification: true });
  setError(null);

  try {
    const response = await fetch(`http://localhost:8000/api/verification/student/${usn}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch verification requests');
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Find the most recent request that matches current semester (if semester is specified)
      const currentSemester = marksData?.semester;
      const matchingRequest = data.data.find((req: any) => 
        !currentSemester || req.semester === currentSemester
      );
      
      if (matchingRequest) {
        setVerificationRequest(matchingRequest);
      }
    }
  } catch (err: any) {
    console.error('Error fetching verification requests:', err);
    // Don't show error to user if this fails - it's not critical
  } finally {
    setLoading({ ...loading, verification: false });
  }
};

// Call this when verification tab is activated
// useEffect(() => {
//   if (activeTab === 'verification' && usn) {
//     fetchVerificationRequests();
//   }
// }, [activeTab, usn]);
  const getCurrentSubjects = (): SubjectMark[] => {
    if (!marksData) return [];
    
    if (marksData.subjects) {
      return marksData.subjects;
    } else if (marksData.semesters) {
      const latestSemester = marksData.semesters.reduce((latest, current) => 
        current.semester > latest.semester ? current : latest
      );
      return latestSemester.subjects;
    }
    
    return [];
  };

  const renderAnalysisTab = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Your Performance Analysis</h2>
      
      {analysis ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Overall Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={`p-4 rounded-lg ${
                analysis.category === 'weak' ? 'bg-red-50 text-red-800' :
                analysis.category === 'average' ? 'bg-yellow-50 text-yellow-800' :
                'bg-green-50 text-green-800'
              }`}>
                <div className="text-2xl font-bold">{analysis.aggregatePercentage}%</div>
                <div className="text-sm font-medium">Overall Score</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold">{analysis.category.toUpperCase()}</div>
                <div className="text-sm text-gray-600">Performance Level</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold">{analysis.confidenceScore}/100</div>
                <div className="text-sm text-blue-600">Analysis Confidence</div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{analysis.categoryStatement}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Improvement Areas</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  {analysis.improvementAreas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h4 className="font-semibold mb-3 text-gray-800">Subject-wise Analysis</h4>
            <div className="space-y-8">
              {analysis.subjectAnalysis.map((subject, i) => {
                const subjectMarks = getCurrentSubjects().find(s => s.subject === subject.subject);
                return (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${
                    subject.status === 'needs_improvement' ? 'bg-red-50 border-red-400' :
                    subject.status === 'satisfactory' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-green-50 border-green-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <h5 className="font-semibold text-lg">{subject.subject}</h5>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        subject.status === 'needs_improvement' ? 'bg-red-200 text-red-800' :
                        subject.status === 'satisfactory' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {subject.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 mb-4">{subject.feedback}</p>
                    
                    {subject.roadmap && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h6 className="font-medium mb-3">1-Month Improvement Plan:</h6>
                        <p className="text-sm mb-3"><span className="font-medium">Goal:</span> {subject.roadmap.overallGoal}</p>
                        <div className="space-y-4">
                          {subject.roadmap.weeklyTasks.map((week) => (
                            <div key={week.week} className="border-l-2 border-blue-300 pl-3">
                              <h6 className="font-medium">Week {week.week}: {week.focusArea}</h6>
                              <ul className="list-disc list-inside pl-2 text-sm space-y-1 mt-1">
                                {week.tasks.map((task, i) => (
                                  <li key={i}>{task}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {subjectMarks && (
                      <div className="mt-4">
                        <h6 className="text-sm font-medium mb-2">Your Progress:</h6>
                        <SubjectProgressChart marks={subjectMarks} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {analysis.nextTestStudyPlan && analysis.nextTestStudyPlan.length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h4 className="font-semibold mb-3 text-gray-800">Next Test Study Plan</h4>
              <ul className="list-disc list-inside space-y-2">
                {analysis.nextTestStudyPlan.map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setActiveTab('fetch')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Marks
            </button>
            <div className="space-x-3">
              <button
                onClick={initiateVerification}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Request Verification
              </button>
              <button
                onClick={analyzePerformance}
                disabled={loading.analysis}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center disabled:opacity-50"
              >
                {loading.analysis ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Re-analyzing...
                  </>
                ) : 'Refresh Analysis'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          {marksData ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Generating your performance analysis...</p>
              <div className="mt-6 space-x-3">
                <button
                  onClick={analyzePerformance}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Analysis
                </button>
                <button
                  onClick={initiateVerification}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Request Verification
                </button>
              </div>
            </>
          ) : (
            <p>No marks data available for analysis</p>
          )}
        </div>
      )}
    </div>
  );

  const renderVerificationTab = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">Marks Verification Request</h2>
    
    {showVerificationForm ? (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Request Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><span className="font-medium">USN:</span> {usn}</p>
            {marksData?.semester && (
              <p><span className="font-medium">Semester:</span> {marksData.semester}</p>
            )}
            <p><span className="font-medium">Subjects:</span> {getCurrentSubjects().map(s => s.subject).join(', ')}</p>
          </div>
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            Reason for Verification Request
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={verificationMessage}
            onChange={(e) => setVerificationMessage(e.target.value)}
            placeholder="Explain why you're requesting verification (e.g., marks seem incorrect, missing subjects, etc.)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => setShowVerificationForm(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={submitVerificationRequest}
            disabled={loading.verification}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {loading.verification ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : 'Submit Request'}
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        {verificationRequest ? (
          <div className={`p-4 rounded-lg ${
            verificationRequest.status === 'approved' ? 'bg-green-50 text-green-800 border border-green-200' :
            verificationRequest.status === 'rejected' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold mb-2">
                {verificationRequest.status === 'approved' ? 'Request Approved' : 
                 verificationRequest.status === 'rejected' ? 'Request Rejected' : 'Request Pending'}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                verificationRequest.status === 'approved' ? 'bg-green-200 text-green-800' :
                verificationRequest.status === 'rejected' ? 'bg-red-200 text-red-800' :
                'bg-blue-200 text-blue-800'
              }`}>
                {verificationRequest.status.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-1">Request Details</h4>
                <p className="text-sm"><span className="font-medium">USN:</span> {verificationRequest.usn}</p>
                {verificationRequest.semester && (
                  <p className="text-sm"><span className="font-medium">Semester:</span> {verificationRequest.semester}</p>
                )}
                <p className="text-sm"><span className="font-medium">Subjects:</span> {verificationRequest.subjects.join(', ')}</p>
                {verificationRequest.createdAt && (
                  <p className="text-sm"><span className="font-medium">Submitted:</span> {new Date(verificationRequest.createdAt).toLocaleString()}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Your Message</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">{verificationRequest.message}</p>
              </div>
            </div>
            
            {verificationRequest.adminFeedback && (
              <div className="mt-4">
                <h4 className="font-medium mb-1">Admin Feedback</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">{verificationRequest.adminFeedback}</p>
              </div>
            )}
            
            {verificationRequest.processedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Processed on: {new Date(verificationRequest.processedAt).toLocaleString()}
              </p>
            )}

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setActiveTab('fetch')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Marks
              </button>
              
              {verificationRequest.status === 'pending' && (
                <button
                  onClick={() => {
                    setVerificationMessage(verificationRequest.message);
                    setShowVerificationForm(true);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Edit Request
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="mb-6">You haven't submitted any verification requests yet.</p>
            <button
              onClick={() => {
                setVerificationMessage('');
                setShowVerificationForm(true);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Create New Request
            </button>
            <button
              onClick={() => setActiveTab('fetch')}
              className="ml-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium"
            >
              Back to Marks
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Student Marks Portal</h1>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'fetch' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('fetch')}
        >
          Fetch Marks
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'analysis' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'} ${!marksData ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => marksData && setActiveTab('analysis')}
          disabled={!marksData}
        >
          Performance Analysis
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'verification' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('verification')}
        >
          Verification
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {activeTab === 'fetch' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Fetch Your Marks</h2>
          
          <div className="mb-6">
            <label className="block mb-2 font-medium">Enter Your USN</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                placeholder="e.g., 1AB22CS001"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Semester (optional)"
                min="1"
                max="8"
                className="w-40 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={fetchMarksByUSN}
                disabled={loading.fetch}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.fetch ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Fetching...
                  </>
                ) : 'Get Marks'}
              </button>
            </div>
            <p className="text-sm text-gray-500">Enter your USN and optionally a semester (1-8). Leave semester blank to get all semesters.</p>
          </div>

          {marksData && (
            <div className="mt-6">
              {marksData.subjects ? (
                // Single semester display
                <>
                  <h3 className="text-lg font-semibold mb-4">Your Marks - Semester {marksData.semester}</h3>
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-3 border-b">
                      <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700">
                        <div>Subject</div>
                        <div className="text-center">CIE 1</div>
                        <div className="text-center">CIE 2</div>
                        <div className="text-center">CIE 3</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {marksData.subjects.map((subject, index) => (
                        <div key={index} className="px-6 py-4 hover:bg-gray-50">
                          <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="font-medium">{subject.subject}</div>
                            <div className="text-center">{subject.cie1}/30</div>
                            <div className="text-center">{subject.cie2}/30</div>
                            <div className="text-center">{subject.cie3}/30</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : marksData.semesters ? (
                // All semesters display
                <>
                  <h3 className="text-lg font-semibold mb-4">Your Marks - All Semesters</h3>
                  <div className="space-y-6">
                    {marksData.semesters.map((semesterData) => (
                      <div key={semesterData.semester} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-blue-50 px-6 py-3 border-b">
                          <h4 className="font-semibold text-blue-800">Semester {semesterData.semester}</h4>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-b">
                          <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700">
                            <div>Subject</div>
                            <div className="text-center">CIE 1</div>
                            <div className="text-center">CIE 2</div>
                            <div className="text-center">CIE 3</div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {semesterData.subjects.map((subject, index) => (
                            <div key={index} className="px-6 py-4 hover:bg-gray-50">
                              <div className="grid grid-cols-4 gap-4 items-center">
                                <div className="font-medium">{subject.subject}</div>
                                <div className="text-center">{subject.cie1}/30</div>
                                <div className="text-center">{subject.cie2}/30</div>
                                <div className="text-center">{subject.cie3}/30</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
                >
                  Analyze Performance
                </button>
                <button
                  onClick={initiateVerification}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium"
                >
                  Request Verification
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'verification' && renderVerificationTab()}
    </div>
  );
}