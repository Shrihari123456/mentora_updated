'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface StudentRecord {
  usn: string;
  subject: string;
  cie1: number;
  cie2: number;
  cie3: number;
  // Status tracking
  status?: 'pending' | 'success' | 'failed' | 'duplicate';
  error?: string;
}

interface UploadResult {
  total: number;
  success: number;
  duplicates: number;
  errors: string[];
  uploadedAt: string;
  processedRecords?: StudentRecord[]; // Add detailed record status
}

export default function AdminExcelUpload() {
  const [loading, setLoading] = useState({ upload: false, submit: false });
  const [parsedRecords, setParsedRecords] = useState<StudentRecord[]>([]);
  const [semester, setSemester] = useState(1);
  const [adminName, setAdminName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);

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

      // Parse Excel data with detailed logging
      const records: StudentRecord[] = [];
      const invalidRecords: any[] = [];

      jsonData.forEach((row, index) => {
        const getValue = (keys: string[]) => {
          const key = keys.find(k => row[k] !== undefined);
          return key ? row[key] : null;
        };

        const record: StudentRecord = {
          usn: String(getValue(['USN', 'usn', 'Student ID']) || '').trim().toUpperCase(),
          subject: String(getValue(['Subject', 'subject', 'Course']) || '').trim(),
          cie1: Number(getValue(['CIE1', 'cie1', 'Test 1'])) || 0,
          cie2: Number(getValue(['CIE2', 'cie2', 'Test 2'])) || 0,
          cie3: Number(getValue(['CIE3', 'cie3', 'Test 3'])) || 0,
          status: 'pending'
        };

        // Detailed validation logging
        const validationErrors = [];
        if (!record.usn) validationErrors.push('Missing USN');
        if (!record.subject) validationErrors.push('Missing Subject');
        if (isNaN(record.cie1) || record.cie1 < 0 || record.cie1 > 30) validationErrors.push(`Invalid CIE1: ${record.cie1}`);
        if (isNaN(record.cie2) || record.cie2 < 0 || record.cie2 > 30) validationErrors.push(`Invalid CIE2: ${record.cie2}`);
        if (isNaN(record.cie3) || record.cie3 < 0 || record.cie3 > 30) validationErrors.push(`Invalid CIE3: ${record.cie3}`);

        if (validationErrors.length === 0) {
          records.push(record);
        } else {
          invalidRecords.push({
            row: index + 1,
            data: row,
            parsed: record,
            errors: validationErrors
          });
        }
      });

      console.log('✅ Valid Records:', records);
      console.log('❌ Invalid Records:', invalidRecords);

      if (records.length === 0) {
        let errorMessage = `No valid records found in Excel file.\n\n`;
        errorMessage += `Found ${invalidRecords.length} invalid records:\n`;
        invalidRecords.slice(0, 5).forEach(inv => {
          errorMessage += `Row ${inv.row}: ${inv.errors.join(', ')}\n`;
        });
        errorMessage += `\nAvailable columns: ${Object.keys(jsonData[0] || {}).join(', ')}`;
        throw new Error(errorMessage);
      }

      // Show validation summary
      if (invalidRecords.length > 0) {
        console.warn(`⚠️ Validation Summary: ${records.length} valid, ${invalidRecords.length} invalid records`);
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
      // Reset all records to pending status
      const recordsToProcess = parsedRecords.map(record => ({
        ...record,
        status: 'pending' as const
      }));
      setParsedRecords(recordsToProcess);

      const response = await fetch('http://localhost:8000/api/marks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          semester,
          records: recordsToProcess,
          adminId: adminName || 'admin'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }
      
      // Update individual record statuses if provided by API
      if (result.data.processedRecords) {
        setParsedRecords(result.data.processedRecords);
      }
      
      setUploadResult(result.data);
      setUploadProgress(null);
      
    } catch (err) {
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
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* Upload Progress */}
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
            ></div>
          </div>
        </div>
      )}

      {/* Success Display */}
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

      {/* Simple Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Admin Name (Optional)</label>
          <input 
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading.submit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Semester</label>
          <select 
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading.submit}
          >
            {[1,2,3,4,5,6,7,8].map(sem => (
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

      {/* File Format Help */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">📋 Excel File Format:</h4>
        <div className="text-sm text-blue-700">
          <div className="grid grid-cols-5 gap-2 font-mono bg-white p-2 rounded">
            <span className="font-bold">USN</span>
            <span className="font-bold">Subject</span>
            <span className="font-bold">CIE1</span>
            <span className="font-bold">CIE2</span>
            <span className="font-bold">CIE3</span>
            <span>4AL21CS001</span>
            <span>Mathematics</span>
            <span>25</span>
            <span>28</span>
            <span>30</span>
          </div>
          <p className="mt-2">• CIE marks should be 0-30 • All columns required</p>
        </div>
      </div>

      {/* Enhanced Preview with Status */}
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
                    <td className="border p-2 font-mono text-xs">{record.usn}</td>
                    <td className="border p-2">{record.subject}</td>
                    <td className="border p-2 text-center">{record.cie1}</td>
                    <td className="border p-2 text-center">{record.cie2}</td>
                    <td className="border p-2 text-center">{record.cie3}</td>
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

      {/* Action Buttons */}
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

      {/* Loading */}
      {loading.upload && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-center">
          ⏳ Processing Excel file...
        </div>
      )}
    </div>
  );
}