'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface StudentRecord {
  sr?: string;
  usn?: string;
  subject: string;
  Test1: number;  // Will be mapped to cie1
  Test2: number;  // Will be mapped to cie2
  Event: number;  // Will be mapped to cie3
  status?: 'pending' | 'success' | 'failed' | 'duplicate';
  error?: string;
}

interface UploadResult {
  total: number;
  success: number;
  duplicates: number;
  errors: string[];
  uploadedAt: string;
  processedRecords?: StudentRecord[];
}

export default function AdminExcelUpload() {
  const [loading, setLoading] = useState({ upload: false, submit: false });
  const [parsedRecords, setParsedRecords] = useState<StudentRecord[]>([]);
  const [semester, setSemester] = useState(1);
  const [adminName, setAdminName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setLoading(prev => ({ ...prev, upload: true }));
    setError(null);
    setUploadResult(null);
  
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
  
      console.log('📊 Raw Excel Data:', jsonData);
      console.log('📋 Available Columns:', Object.keys(jsonData[0] || {}));
  
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }
  
      const records: StudentRecord[] = [];
      const invalidRecords: any[] = [];
  
      jsonData.forEach((row, index) => {
        const getValue = (keys: string[]) => {
          const key = keys.find(k => row[k] !== undefined && row[k] !== null && row[k] !== '');
          return key ? row[key] : null;
        };
  
        // ✅ FIX: Accept ANY value for SR - string, number, anything
        const srRaw = getValue(['SR', 'sr', 'Sr', 'S.No', 'S.No.', 'SNo', 'Serial', 'serial']);
        const sr = srRaw !== null ? String(srRaw).trim() : undefined;
  
        const usnRaw = getValue(['USN', 'usn', 'Student ID']);
        const usn = usnRaw ? String(usnRaw).trim().toUpperCase() : undefined;
  
        // Parse marks - handle any input
        const parseMark = (value: any): number => {
          if (value === undefined || value === null || value === '') return 0;
          const num = Number(value);
          return isNaN(num) ? 0 : Math.min(30, Math.max(0, num));
        };
  
        const record: StudentRecord = {
          sr: sr || undefined,
          usn: usn || undefined,
          subject: String(getValue(['Subject', 'subject', 'Course']) || '').trim(),
          Test1: parseMark(getValue(['CIE1', 'cie1', 'Test 1'])),
          Test2: parseMark(getValue(['CIE2', 'cie2', 'Test 2'])),
          Event: parseMark(getValue(['CIE3', 'cie3', 'Test 3'])),
          status: 'pending',
        };
  
        const validationErrors: string[] = [];
  
        // ✅ ONLY validate: either SR OR USN must exist (can be anything)
        if (!record.sr && !record.usn) {
          validationErrors.push('Either SR or USN is required');
        }
  
        // Subject is required
        if (!record.subject) {
          validationErrors.push('Missing Subject');
        }
  
        // ✅ No validation on SR format - accept anything (NOT FOUND, 57, 16, UU240403, etc.)
  
        if (validationErrors.length === 0) {
          records.push(record);
        } else {
          invalidRecords.push({ 
            row: index + 2,
            data: row, 
            parsed: record, 
            errors: validationErrors 
          });
        }
      });
  
      console.log('✅ Valid Records:', records);
      console.log('❌ Invalid Records (missing SR/USN or subject):', invalidRecords);
  
      if (records.length === 0) {
        let errorMessage = `No valid records found in Excel file.\n\n`;
        errorMessage += `Found ${invalidRecords.length} invalid records:\n`;
        invalidRecords.slice(0, 5).forEach(inv => {
          errorMessage += `Row ${inv.row}: ${inv.errors.join(', ')}\n`;
        });
        errorMessage += `\nAvailable columns: ${Object.keys(jsonData[0] || {}).join(', ')}`;
        throw new Error(errorMessage);
      }
  
      if (invalidRecords.length > 0) {
        console.warn(`⚠️ Validation Summary: ${records.length} valid, ${invalidRecords.length} invalid records`);
        // Optional: Show warning but continue
        // setError(`⚠️ ${invalidRecords.length} records were skipped. ${records.length} valid records loaded.`);
      }
  
      setParsedRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process Excel file');
      setParsedRecords([]);
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const handleSubmit = async () => {
    if (parsedRecords.length === 0) {
      setError('No records to upload');
      return;
    }
  
    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    setUploadResult(null);
    setUploadProgress({ current: 0, total: parsedRecords.length });
  
    try {
      const recordsToProcess = parsedRecords.map(record => ({
        ...record,
        status: 'pending' as const,
      }));
      setParsedRecords(recordsToProcess);
  
      // ✅ Transform records to match backend expectations
      const transformedRecords = recordsToProcess.map(record => ({
        usn: record.usn,        // Required by backend
        subject: record.subject, // Required by backend
        cie1: record.Test1,     // Map Test1 -> cie1 (must be number 0-30)
        cie2: record.Test2,     // Map Test2 -> cie2 (must be number 0-30)
        cie3: record.Event,     // Map Event -> cie3 (must be number 0-30)
        sr: record.sr,          // Optional, but can include
      }));
  
      const requestBody = {
        semester: Number(semester), // Ensure it's a number
        adminId: adminName || 'admin',
        records: transformedRecords,
      };
      
      console.log('📤 Sending to backend:', JSON.stringify(requestBody, null, 2));
      console.log('📊 First record sample:', transformedRecords[0]);
  
      const response = await fetch('http://localhost:8000/api/marks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
  
      const result = await response.json();
      
      console.log('📥 Backend response:', result);
  
      if (!response.ok) {
        throw new Error(result.message || `Upload failed with status ${response.status}`);
      }
  
      // Update local records with results (optional)
      if (result.data && result.data.processedRecords) {
        setParsedRecords(result.data.processedRecords);
      }
  
      setUploadResult(result.data);
      setUploadProgress(null);
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(null);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const resetAll = () => {
    setParsedRecords([]);
    setError(null);
    setUploadResult(null);
    setUploadProgress(null);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'duplicate': return '🔄';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'duplicate': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">📊 Upload Student Marks</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded whitespace-pre-line">
          ❌ {error}
        </div>
      )}

      {uploadProgress && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded">
          <div className="flex items-center justify-between mb-2">
            <span>⏳ Processing records...</span>
            <span>{uploadProgress.current}/{uploadProgress.total}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {uploadResult && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded">
          <h3 className="font-bold">✅ Upload Completed!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{uploadResult.total}</div>
              <div>📊 Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
              <div>✅ Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{uploadResult.duplicates}</div>
              <div>🔄 Duplicates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{uploadResult.errors.length}</div>
              <div>❌ Failed</div>
            </div>
          </div>
          {uploadResult.errors.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer font-medium">❌ View Error Details ({uploadResult.errors.length})</summary>
              <ul className="mt-2 text-sm list-disc list-inside max-h-32 overflow-y-auto">
                {uploadResult.errors.map((err, i) => <li key={i} className="text-red-600">{err}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Admin Name (Optional)</label>
          <input
            type="text"
            value={adminName}
            onChange={e => setAdminName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading.submit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Semester</label>
          <select
            value={semester}
            onChange={e => setSemester(Number(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading.submit}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excel File</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelUpload}
            disabled={loading.upload || loading.submit}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">📋 Excel File Format:</h4>
        <div className="text-sm text-blue-700">
          <div className="overflow-x-auto">
            <table className="font-mono bg-white rounded text-xs w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border">SR</th>
                  <th className="p-2 text-left border">USN</th>
                  <th className="p-2 text-left border">Subject</th>
                  <th className="p-2 text-left border">CIE1</th>
                  <th className="p-2 text-left border">CIE2</th>
                  <th className="p-2 text-left border">CIE3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">UU240403</td>
                  <td className="p-2 border text-gray-400">—</td>
                  <td className="p-2 border">Mathematics</td>
                  <td className="p-2 border">25</td>
                  <td className="p-2 border">28</td>
                  <td className="p-2 border">30</td>
                </tr>
                <tr>
                  <td className="p-2 border">UU246040</td>
                  <td className="p-2 border">01JST24UCS005</td>
                  <td className="p-2 border">Physics</td>
                  <td className="p-2 border">20</td>
                  <td className="p-2 border">22</td>
                  <td className="p-2 border">25</td>
                </tr>
                <tr>
                  <td className="p-2 border text-gray-400">—</td>
                  <td className="p-2 border">01JST24UCS010</td>
                  <td className="p-2 border">Chemistry</td>
                  <td className="p-2 border">18</td>
                  <td className="p-2 border">20</td>
                  <td className="p-2 border">22</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2">
            • <strong>SR or USN required</strong> — SR can be a string like UU240403<br />
            • CIE marks should be 0–30 &nbsp;•&nbsp; Subject is required
          </p>
        </div>
      </div>

      {parsedRecords.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">📋 Records: {parsedRecords.length} Total</h3>
            {uploadResult && (
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✅ {parsedRecords.filter(r => r.status === 'success').length}</span>
                <span className="text-yellow-600">🔄 {parsedRecords.filter(r => r.status === 'duplicate').length}</span>
                <span className="text-red-600">❌ {parsedRecords.filter(r => r.status === 'failed').length}</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">SR</th>
                  <th className="border p-2 text-left">USN</th>
                  <th className="border p-2 text-left">Subject</th>
                  <th className="border p-2">CIE1</th>
                  <th className="border p-2">CIE2</th>
                  <th className="border p-2">CIE3</th>
                  <th className="border p-2 text-left">Error</th>
                </tr>
              </thead>
              <tbody>
                {parsedRecords.slice(0, 10).map((record, i) => (
                  <tr key={i} className={`${getStatusColor(record.status)} border-b`}>
                    <td className="border p-2 text-center">
                      <span className="inline-block w-6">{getStatusIcon(record.status)}</span>
                    </td>
                    <td className="border p-2 text-center text-gray-500">{record.sr ?? '—'}</td>
                    <td className="border p-2 font-mono text-xs">{record.usn ?? '—'}</td>
                    <td className="border p-2">{record.subject}</td>
                    {/* ✅ FIX 4: display correct field names */}
                    <td className="border p-2 text-center">{record.Test1}</td>
                    <td className="border p-2 text-center">{record.Test2}</td>
                    <td className="border p-2 text-center">{record.Event}</td>
                    <td className="border p-2 text-xs text-red-600">
                      {record.error && (
                        <span title={record.error}>
                          {record.error.length > 30 ? record.error.substring(0, 30) + '...' : record.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRecords.length > 10 && (
              <p className="text-center text-gray-500 mt-2">...and {parsedRecords.length - 10} more</p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading.submit || parsedRecords.length === 0}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading.submit ? '⏳ Uploading...' : `🚀 Upload ${parsedRecords.length} Records`}
        </button>

        {(parsedRecords.length > 0 || error || uploadResult) && (
          <button
            onClick={resetAll}
            disabled={loading.submit}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {loading.upload && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-center">
          ⏳ Processing Excel file...
        </div>
      )}
    </div>
  );
}