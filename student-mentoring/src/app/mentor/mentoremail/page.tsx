'use client';

import { useState, useEffect } from 'react';
import { Mail, X, Send } from 'lucide-react';

interface MenteeOption {
  _id: string;
  name: string;
  usn: string;
  email: string;
}

interface MentorEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
}

export default function MentorEmailModal({ 
  isOpen, 
  onClose, 
  mentorId,
  mentorName 
}: MentorEmailModalProps) {
  const [mentees, setMentees] = useState<MenteeOption[]>([]);
  const [selectedMentee, setSelectedMentee] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMentees, setLoadingMentees] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ 
    type: null, 
    message: '' 
  });

  useEffect(() => {
    if (isOpen) {
      fetchMentees();
    }
  }, [isOpen, mentorId]);

  const fetchMentees = async () => {
    setLoadingMentees(true);
    try {
      // Use the correct endpoint that matches your backend route
      const response = await fetch(`http://localhost:8000/api/mentor/${mentorId}/students`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The data should be an array of students
      if (Array.isArray(data)) {
        setMentees(data);
      } else {
        console.error('Unexpected data format:', data);
        setStatus({ type: 'error', message: 'Unexpected data format from server' });
        setMentees([]);
      }
    } catch (error) {
      console.error('Failed to fetch mentees:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to load mentees. Please check if mentor ID is correct and mentees are assigned.' 
      });
      setMentees([]);
    } finally {
      setLoadingMentees(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedMentee || !subject.trim() || !message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('http://localhost:8000/api/email/mentor-to-mentee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId,
          studentId: selectedMentee,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Email sent successfully!' });
        setSelectedMentee('');
        setSubject('');
        setMessage('');
        setTimeout(() => {
          onClose();
          setStatus({ type: null, message: '' });
        }, 2000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to send email' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAll = async () => {
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in subject and message' });
      return;
    }

    if (mentees.length === 0) {
      setStatus({ type: 'error', message: 'No mentees to send email to' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const promises = mentees.map(mentee =>
        fetch('http://localhost:8000/api/email/mentor-to-mentee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mentorId,
            studentId: mentee._id,
            subject,
            message,
          }),
        })
      );

      await Promise.all(promises);
      setStatus({ type: 'success', message: `Email sent to all ${mentees.length} mentees!` });
      setSubject('');
      setMessage('');
      setTimeout(() => {
        onClose();
        setStatus({ type: null, message: '' });
      }, 2000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send emails to all mentees' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedMenteeData = mentees.find(m => m._id === selectedMentee);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Your Mentees</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status Message */}
          {status.type && (
            <div
              className={`p-4 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* From Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <input
              type="text"
              value={mentorName}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Select Mentee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To (Select Mentee) *
            </label>
            {loadingMentees ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-blue-600 border-b-2"></div>
              </div>
            ) : (
              <select
                value={selectedMentee}
                onChange={(e) => setSelectedMentee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a mentee...</option>
                {mentees.map((mentee) => (
                  <option key={mentee._id} value={mentee._id}>
                    {mentee.name} ({mentee.usn})
                  </option>
                ))}
              </select>
            )}
            {selectedMenteeData && (
              <p className="text-sm text-gray-500 mt-1">
                Email: {selectedMenteeData.email}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Character count */}
          <div className="text-right text-sm text-gray-500">
            {message.length} characters
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSendToAll}
            disabled={loading || !subject.trim() || !message.trim() || mentees.length === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to All Mentees
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={loading || !selectedMentee || !subject.trim() || !message.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}