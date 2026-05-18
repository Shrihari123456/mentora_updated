'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SubjectMark {
  subject: string;
  cie1: number;
  cie2: number;
  cie3: number;
}

interface StudentInfo {
  name: string;
  srNo: string;
  [key: string]: any;
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
  sr?: string;
  semester?: number | null;  // ✅ Made optional with null possible
  subjects: string[];
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  createdAt?: Date;
  processedAt?: Date;
}

interface MarksData {
  sr?: string;
  usn?: string;
  semester?: number;
  subjects?: SubjectMark[];
  semesters?: {
    semester: number;
    subjects: SubjectMark[];
  }[];
}

// ─── Chart Component ────────────────────────────────────────────────────────

const SubjectProgressChart = ({ marks }: { marks: SubjectMark }) => {
  const data = [
    { name: 'CIE 1', marks: marks.cie1 },
    { name: 'CIE 2', marks: marks.cie2 },
    { name: 'CIE 3', marks: marks.cie3 },
  ];

  return (
    <div className="h-48 w-full">
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

// ─── Spinner ────────────────────────────────────────────────────────────────

const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const cls = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-10 h-10 border-4' : 'w-6 h-6 border-2';
  return (
    <span className={`animate-spin inline-block ${cls} border-white border-t-transparent rounded-full`} />
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StudentMarksPage() {
  const router = useRouter();

  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState({ fetch: false, analysis: false, verification: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [marksData, setMarksData] = useState<MarksData | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'fetch' | 'analysis' | 'verification'>('fetch');
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  // ── Load student from localStorage ──────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (stored) {
      try {
        const student = JSON.parse(stored);
        setStudentInfo(student);
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  // ── Auto-fetch marks once student info is available ──────────────────────
  useEffect(() => {
    if (studentInfo?.srNo) {
      fetchMarksBySR(studentInfo.srNo);
    }
  }, [studentInfo]);

  // ── Fetch marks by SR ────────────────────────────────────────────────────
  const fetchMarksBySR = async (sr: string, semesterFilter?: string) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null);
    setSuccess(null);
    setMarksData(null);

    try {
      const params = new URLSearchParams();
      params.append('sr', sr);

      const sem = semesterFilter !== undefined ? semesterFilter : semester;
      if (sem && sem.trim()) {
        params.append('semester', sem.trim());
      }

      const response = await fetch(
        `http://localhost:8000/api/marks/markbyusn?${params.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch marks');
      }

      if (!data || (!data.subjects && !data.semesters)) {
        throw new Error('No marks found for your SR number');
      }

      setMarksData(data);
      setSuccess(sem ? `Marks loaded for Semester ${sem}` : 'All semester marks loaded');
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching marks');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // ── Get current subjects (for analysis / verification) ───────────────────
  const getCurrentSubjects = (): SubjectMark[] => {
    if (!marksData) return [];
    if (marksData.subjects) return marksData.subjects;
    if (marksData.semesters) {
      const latest = marksData.semesters.reduce((a, b) =>
        b.semester > a.semester ? b : a
      );
      return latest.subjects;
    }
    return [];
  };

  // ── Analyze performance via Gemini ───────────────────────────────────────
  const analyzePerformance = async () => {
    if (!marksData) return;

    setLoading(prev => ({ ...prev, analysis: true }));
    setError(null);

    try {
      const validSubjects = getCurrentSubjects().filter(s => s.subject.trim() !== '');

      if (validSubjects.length === 0) throw new Error('No valid subjects to analyze');

      const apiKey = 'AIzaSyCoWsuWWURiT55UOzBnw0utyrnt0M-TmVQ';

      const prompt = `
Analyze the following student marks and provide a detailed performance assessment.
First calculate the aggregate percentage across all subjects (average of all CIE marks).
Marks are out of 30

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
   - For weak subjects (marks < 10/30), include a 1-month roadmap:
     Week 1: Fundamental concepts
     Week 2: Practice problems
     Week 3: Mock tests
     Week 4: Revision and weak areas
7. Next test study plan with actionable tasks

FORMAT YOUR RESPONSE AS VALID JSON ONLY — no markdown, no extra text:
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
        { "week": 1, "focusArea": "string", "tasks": ["string"] },
        { "week": 2, "focusArea": "string", "tasks": ["string"] },
        { "week": 3, "focusArea": "string", "tasks": ["string"] },
        { "week": 4, "focusArea": "string", "tasks": ["string"] }
      ]
    }
  }],
  "nextTestStudyPlan": ["string"]
}

MARKS DATA:
${JSON.stringify(validSubjects, null, 2)}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`AI analysis failed: ${err.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error('No valid response from AI');

      const jsonStart = textResponse.indexOf('{');
      const jsonEnd = textResponse.lastIndexOf('}') + 1;
      const analysisResult: PerformanceAnalysis = JSON.parse(textResponse.slice(jsonStart, jsonEnd));

      setAnalysis(analysisResult);
      setSuccess('Performance analysis completed!');
    } catch (err: any) {
      setError(`Analysis Error: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, analysis: false }));
    }
  };

  // ── Initiate verification ────────────────────────────────────────────────
  const initiateVerification = () => {
    if (!marksData) return;
    setVerificationRequest({
      sr: studentInfo?.srNo,
      semester: marksData.semester,
      subjects: getCurrentSubjects().map(s => s.subject),
      message: '',
      status: 'pending',
    });
    setShowVerificationForm(true);
    setActiveTab('verification');
  };

// ── Submit verification request ──────────────────────────────────────────
const submitVerificationRequest = async () => {
  if (!verificationMessage.trim()) {
    setError('Please enter a reason for verification');
    return;
  }

  setLoading(prev => ({ ...prev, verification: true }));
  setError(null);

  try {
    const subjectNames = getCurrentSubjects().map(s => s.subject);

    // ✅ Build payload - semester optional
    const payload: any = {
      sr: studentInfo?.srNo,
      subjects: subjectNames,
      message: verificationMessage.trim(),
    };
    
    // ✅ Only add semester if it exists and is valid
    if (marksData?.semester && marksData.semester > 0) {
      payload.semester = marksData.semester;
    }

    console.log('📤 Submitting verification request:', payload);

    const response = await fetch('http://localhost:8000/api/verification/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📥 Response:', data);

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to submit verification request');
    }

    setVerificationRequest({
      sr: studentInfo?.srNo,
      semester: marksData?.semester,
      subjects: subjectNames,
      message: verificationMessage.trim(),
      status: 'pending',
      ...data.data,
    });

    setSuccess(data.message || 'Verification request submitted!');
    setShowVerificationForm(false);
    setVerificationMessage('');
  } catch (err: any) {
    console.error('❌ Verification error:', err);
    setError(err.message);
  } finally {
    setLoading(prev => ({ ...prev, verification: false }));
  }
};

  // ── Render: Marks Table ──────────────────────────────────────────────────
  const renderMarksTable = (subjects: SubjectMark[]) => (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700 text-sm">
          <div>Subject</div>
          <div className="text-center">CIE 1</div>
          <div className="text-center">CIE 2</div>
          <div className="text-center">CIE 3</div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {subjects.map((subject, index) => (
          <div key={index} className="px-6 py-3 hover:bg-gray-50">
            <div className="grid grid-cols-4 gap-4 items-center text-sm">
              <div className="font-medium">{subject.subject}</div>
              <div className="text-center">{subject.cie1 ?? '—'}/30</div>
              <div className="text-center">{subject.cie2 ?? '—'}/30</div>
              <div className="text-center">{subject.cie3 ?? '—'}/30</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render: Analysis Tab ─────────────────────────────────────────────────
  const renderAnalysisTab = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>

      {analysis ? (
        <div className="space-y-6">
          {/* Summary Cards */}
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
                <div className="text-sm text-blue-600">Confidence Score</div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{analysis.categoryStatement}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Improvement Areas</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.improvementAreas.map((area, i) => <li key={i}>{area}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Subject-wise */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h4 className="font-semibold mb-4 text-gray-800">Subject-wise Analysis</h4>
            <div className="space-y-6">
              {analysis.subjectAnalysis.map((subject, i) => {
                const subjectMarks = getCurrentSubjects().find(s => s.subject === subject.subject);
                return (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${
                    subject.status === 'needs_improvement' ? 'bg-red-50 border-red-400' :
                    subject.status === 'satisfactory' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-green-50 border-green-400'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-base">{subject.subject}</h5>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        subject.status === 'needs_improvement' ? 'bg-red-200 text-red-800' :
                        subject.status === 'satisfactory' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {subject.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{subject.feedback}</p>

                    {subject.roadmap && (
                      <div className="bg-white bg-opacity-60 p-3 rounded-lg mb-3">
                        <h6 className="font-medium mb-2 text-sm">1-Month Plan — {subject.roadmap.overallGoal}</h6>
                        <div className="space-y-3">
                          {subject.roadmap.weeklyTasks.map(week => (
                            <div key={week.week} className="border-l-2 border-blue-300 pl-3">
                              <p className="font-medium text-sm">Week {week.week}: {week.focusArea}</p>
                              <ul className="list-disc list-inside text-xs space-y-1 mt-1 text-gray-700">
                                {week.tasks.map((task, j) => <li key={j}>{task}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {subjectMarks && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1 text-gray-600">Progress across CIEs:</p>
                        <SubjectProgressChart marks={subjectMarks} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study Plan */}
          {analysis.nextTestStudyPlan?.length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h4 className="font-semibold mb-3 text-gray-800">Next Test Study Plan</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {analysis.nextTestStudyPlan.map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setActiveTab('fetch')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Back to Marks
            </button>
            <div className="flex gap-3">
              <button onClick={initiateVerification}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm">
                Request Verification
              </button>
              <button onClick={analyzePerformance} disabled={loading.analysis}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center gap-2">
                {loading.analysis ? <><Spinner size="sm" /> Re-analyzing...</> : 'Refresh Analysis'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          {marksData ? (
            <>
              <p className="text-gray-500 mb-6">Generate your AI-powered performance report.</p>
              <div className="flex justify-center gap-3">
                <button onClick={analyzePerformance} disabled={loading.analysis}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {loading.analysis ? <><Spinner size="sm" /> Analyzing...</> : 'Start Analysis'}
                </button>
                <button onClick={initiateVerification}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                  Request Verification
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No marks data. Go back and load your marks first.</p>
          )}
        </div>
      )}
    </div>
  );

  // ── Render: Verification Tab ─────────────────────────────────────────────
  const renderVerificationTab = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Marks Verification Request</h2>

      {showVerificationForm ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p><span className="font-medium">SR Number:</span> {studentInfo?.srNo}</p>
            <p><span className="font-medium">Name:</span> {studentInfo?.name}</p>
            {marksData?.semester && (
              <p><span className="font-medium">Semester:</span> {marksData.semester}</p>
            )}
            <p><span className="font-medium">Subjects:</span> {getCurrentSubjects().map(s => s.subject).join(', ')}</p>
          </div>

          <div>
            <label className="block font-medium mb-2 text-sm">
              Reason for Verification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={verificationMessage}
              onChange={e => setVerificationMessage(e.target.value)}
              placeholder="Explain why you're requesting verification (e.g., marks seem incorrect, missing subject, etc.)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowVerificationForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">
              Cancel
            </button>
            <button onClick={submitVerificationRequest} disabled={loading.verification}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2">
              {loading.verification ? <><Spinner size="sm" /> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </div>
      ) : verificationRequest ? (
        <div className={`p-4 rounded-lg border ${
          verificationRequest.status === 'approved' ? 'bg-green-50 border-green-200' :
          verificationRequest.status === 'rejected' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold">
              {verificationRequest.status === 'approved' ? '✅ Request Approved' :
               verificationRequest.status === 'rejected' ? '❌ Request Rejected' : '⏳ Request Pending'}
            </h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              verificationRequest.status === 'approved' ? 'bg-green-200 text-green-800' :
              verificationRequest.status === 'rejected' ? 'bg-red-200 text-red-800' :
              'bg-blue-200 text-blue-800'
            }`}>
              {verificationRequest.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Request Details</h4>
              <p><span className="font-medium">SR Number:</span> {studentInfo?.srNo}</p>
              <p><span className="font-medium">Name:</span> {studentInfo?.name}</p>
              {verificationRequest.semester && (
                <p><span className="font-medium">Semester:</span> {verificationRequest.semester}</p>
              )}
              <p><span className="font-medium">Subjects:</span> {verificationRequest.subjects.join(', ')}</p>
              {verificationRequest.createdAt && (
                <p><span className="font-medium">Submitted:</span> {new Date(verificationRequest.createdAt).toLocaleString()}</p>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-1">Your Message</h4>
              <p className="bg-white p-2 rounded border text-sm">{verificationRequest.message}</p>
            </div>
          </div>

          {verificationRequest.adminFeedback && (
            <div className="mt-4">
              <h4 className="font-medium mb-1 text-sm">Admin Feedback</h4>
              <p className="bg-white p-2 rounded border text-sm">{verificationRequest.adminFeedback}</p>
            </div>
          )}

          {verificationRequest.processedAt && (
            <p className="text-xs text-gray-500 mt-3">
              Processed: {new Date(verificationRequest.processedAt).toLocaleString()}
            </p>
          )}

          <div className="flex justify-between mt-4">
            <button onClick={() => setActiveTab('fetch')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Back to Marks
            </button>
            {verificationRequest.status === 'pending' && (
              <button onClick={() => {
                setVerificationMessage(verificationRequest.message);
                setShowVerificationForm(true);
              }} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm">
                Edit Request
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-6">No verification requests submitted yet.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setVerificationMessage(''); setShowVerificationForm(true); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Request
            </button>
            <button onClick={() => setActiveTab('fetch')}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Back to Marks
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Main Render ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Marks Portal</h1>
        {studentInfo && (
          <p className="text-gray-500 mt-1 text-sm">
            Welcome, <span className="font-medium text-gray-700">{studentInfo.name}</span>
            &nbsp;·&nbsp;SR No:&nbsp;
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{studentInfo.srNo}</span>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(['fetch', 'analysis', 'verification'] as const).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } ${tab === 'analysis' && !marksData ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (tab === 'analysis' && !marksData) return;
              setActiveTab(tab);
            }}
          >
            {tab === 'fetch' ? 'My Marks' : tab === 'analysis' ? 'Performance Analysis' : 'Verification'}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm whitespace-pre-line">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>
      )}

      {/* ── My Marks Tab ── */}
      {activeTab === 'fetch' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Marks</h2>

          {/* Semester filter + refresh */}
          <div className="flex gap-2 mb-6">
            <input
              type="number"
              value={semester}
              onChange={e => setSemester(e.target.value)}
              placeholder="Semester (optional, 1–8)"
              min="1"
              max="8"
              className="w-56 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => studentInfo && fetchMarksBySR(studentInfo.srNo, semester)}
              disabled={loading.fetch || !studentInfo}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading.fetch ? <><Spinner size="sm" /> Loading...</> : 'Refresh'}
            </button>
          </div>

          {/* Loading skeleton */}
          {loading.fetch && !marksData && (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          )}

          {/* Marks display */}
          {marksData && (
            <>
              {marksData.subjects ? (
                <>
                  <h3 className="text-base font-semibold mb-3 text-gray-700">
                    Semester {marksData.semester}
                  </h3>
                  {renderMarksTable(marksData.subjects)}
                </>
              ) : marksData.semesters ? (
                <>
                  <h3 className="text-base font-semibold mb-3 text-gray-700">All Semesters</h3>
                  <div className="space-y-5">
                    {marksData.semesters.map(semData => (
                      <div key={semData.semester}>
                        <div className="bg-blue-50 px-4 py-2 rounded-t-lg border border-b-0 border-blue-100">
                          <h4 className="font-semibold text-blue-800 text-sm">Semester {semData.semester}</h4>
                        </div>
                        {renderMarksTable(semData.subjects)}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="mt-6 flex justify-between">
                <button onClick={() => setActiveTab('analysis')}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium">
                  Analyze Performance
                </button>
                <button onClick={initiateVerification}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium">
                  Request Verification
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'verification' && renderVerificationTab()}
    </div>
  );
}