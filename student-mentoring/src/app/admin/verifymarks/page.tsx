'use client';

import { useState, useEffect, useCallback } from 'react';

interface VerificationRequest {
  _id: string;
  usn?: string;
  sr?: string;
  semester?: number;
  subjects: string[];
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  createdAt: string;
  processedAt?: string;
  student?: {
    name: string;
    email: string;
    usn: string;
  };
}

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState<VerificationStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState({
    fetch: false,
    process: false,
    refresh: false,
    stats: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await fetch('http://localhost:8000/api/verification/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      const response = await fetch(`http://localhost:8000/api/verification/from-marks?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch verification requests');
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load verification requests');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter]);

  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, refresh: true }));
    await Promise.all([fetchRequests(), fetchStats()]);
    setLoading(prev => ({ ...prev, refresh: false }));
  };

  const handleProcessRequest = async (action: 'approved' | 'rejected') => {
    if (!selectedRequest || !feedback.trim()) {
      setError('Please provide feedback before processing');
      return;
    }

    setLoading(prev => ({ ...prev, process: true }));
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:8000/api/verification/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminFeedback: feedback.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process request');

      setRequests(prev =>
        prev.map(req =>
          req._id === selectedRequest._id
            ? { ...req, status: action, adminFeedback: feedback.trim(), processedAt: new Date().toISOString() }
            : req
        )
      );

      setSelectedRequest(prev =>
        prev ? { ...prev, status: action, adminFeedback: feedback.trim(), processedAt: new Date().toISOString() } : null
      );

      setFeedback('');
      setSuccess(`Request ${action} successfully!`);
      await Promise.all([fetchRequests(), fetchStats()]);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to process request:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  const viewRequestDetails = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/verification/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch request details');
      setSelectedRequest(data.data);
    } catch (err) {
      console.error('Failed to fetch request details:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default:         return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':  return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default:         return '❓';
    }
  };

  return (
    <div className="container mx-auto p-4">

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-yellow-800 font-bold">Pending</h3>
          <p className="text-2xl">{stats.pending}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-green-800 font-bold">Approved</h3>
          <p className="text-2xl">{stats.approved}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-red-800 font-bold">Rejected</h3>
          <p className="text-2xl">{stats.rejected}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-blue-800 font-bold">Total</h3>
          <p className="text-2xl">{stats.total}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex mb-4 border-b border-gray-200">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
          <button
            key={status}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              statusFilter === status
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-1 bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                {status === 'pending' ? stats.pending : status === 'approved' ? stats.approved : stats.rejected}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SR No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subjects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading.fetch ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  Loading...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  No verification requests found.
                </td>
              </tr>
            ) : (
              requests.map(request => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium font-mono text-sm">
                    {request.sr ?? request.usn ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    {request.subjects?.join(', ') ?? '—'}
                  </td>
                  <td className="px-6 py-4 max-w-xs text-sm">
                    <p className="truncate" title={request.message}>
                      {request.message}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)} {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewRequestDetails(request._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {request.status === 'pending' ? 'Process' : 'View'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">Verification Request</h3>

            <div className="space-y-3">

              {/* SR No */}
              <div>
                <p className="text-sm text-gray-500">SR No</p>
                <p className="font-medium font-mono">
                  {selectedRequest.sr ?? selectedRequest.usn ?? '—'}
                </p>
              </div>

              {/* Semester */}
              {selectedRequest.semester && (
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium">{selectedRequest.semester}</p>
                </div>
              )}

              {/* Subjects */}
              {selectedRequest.subjects?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Subjects</p>
                  <p className="font-medium">{selectedRequest.subjects.join(', ')}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-sm text-gray-500">Student's Message</p>
                <p className="p-2 bg-gray-100 rounded text-sm">{selectedRequest.message}</p>
              </div>

              {/* Submitted at */}
              {selectedRequest.createdAt && (
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              )}

              {/* Feedback input — only if pending */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter your feedback for the student..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                  />
                </div>
              )}

              {/* Admin feedback — if already processed */}
              {selectedRequest.status !== 'pending' && selectedRequest.adminFeedback && (
                <div>
                  <p className="text-sm text-gray-500">Admin Feedback</p>
                  <p className="p-2 bg-gray-100 rounded text-sm">{selectedRequest.adminFeedback}</p>
                </div>
              )}

              {/* Processed at */}
              {selectedRequest.processedAt && (
                <p className="text-xs text-gray-400">
                  Processed: {new Date(selectedRequest.processedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleProcessRequest('rejected')}
                    disabled={!feedback.trim() || loading.process}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                  >
                    {loading.process ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleProcessRequest('approved')}
                    disabled={!feedback.trim() || loading.process}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    {loading.process ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
              <button
                onClick={() => { setSelectedRequest(null); setFeedback(''); }}
                className="border px-4 py-2 rounded hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total} total
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}