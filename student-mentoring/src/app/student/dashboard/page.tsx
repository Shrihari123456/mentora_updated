'use client';

import { useState, useEffect } from 'react';
import { User, Book, Calendar, MapPin, Mail, X, Send, MessageCircle } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  link?: string;
}

export default function StudentDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Replace these with actual values from your auth/session
  const studentId = "CA242711"; // Get from session/auth
  const mentorId = "MNT001"; // Get from student data
  const studentName = "Shrihari";
  const studentUSN = "CA242711";

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hackathon': return 'bg-purple-100 text-purple-800';
      case 'test': return 'bg-red-100 text-red-800';
      case 'workshop': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const fetchEvents = async (location: string) => {
    try {
      setLoadingEvents(true);
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      const params = new URLSearchParams({
        location: location,
        startDate: today.toISOString(),
        endDate: nextMonth.toISOString()
      });

      const res = await fetch(`http://localhost:8000/api/events?${params}`);
      const data = await res.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSearch = () => {
    if (searchLocation.trim() !== '') {
      fetchEvents(searchLocation.trim());
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const city = 'Bangalore';
        setUserLocation(city);
        setSearchLocation(city);
        fetchEvents(city);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to fetch your location');
      }
    );
  };

  useEffect(() => {
    fetchEvents('Bangalore');
  }, []);

  return (
    <div 
      className="min-h-screen" 
      style={{
        background: `
          linear-gradient(to bottom right, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95)),
          url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Welcome, {studentName}</h1>
          <p className="text-gray-600">USN: <span className="font-medium text-indigo-600">{studentUSN}</span></p>
        </div>

        {/* Email Mentor Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
          >
            <Mail size={20} />
            Email My Mentor
          </button>
        </div>

        {/* Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search events by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Search
            </button>
            <button
              onClick={handleUseMyLocation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              <MapPin size={16} /> Use My Location
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "My Details",
              description: "View and update your personal information",
              icon: <User size={24} />,
              color: "bg-indigo-100 text-indigo-600",
              path: "/student/",
            },
            {
              title: "View Marks",
              description: "Check your grades and performance",
              icon: <Book size={24} />,
              color: "bg-blue-100 text-blue-600",
              path: "/student/addmarks",
            },
            {
              title: "Chat with Mentor",
              description: "Send and receive messages from your mentor",
              icon: <MessageCircle size={24} />,
              color: "bg-purple-100 text-purple-600",
              path: "/student/chat",
            },
            {
              title: "Meeting Schedule",
              description: "Meeting with your mentor",
              icon: <Calendar size={24} />,
              color: "bg-yellow-100 text-yellow-600",
              path: "/student/request",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              onClick={() => window.location.href = card.path}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>{card.icon}</div>
                <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
              </div>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Events Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
              <Calendar size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Hackathons</h2>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-green-600 border-b-2"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {events.filter(e => e.type === 'hackathon').slice(0, 3).map(event => (
                <div
                  key={event._id}
                  onClick={() => window.open(event.link || '#', '_blank')}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                    <MapPin size={12} />
                    <span>{event.location}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hackathons found</p>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={() => window.location.href = '/student/studentevent'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              View All Events
            </button>
          </div>
        </div>

        {/* Academic Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard label="Current Semester" value="5" color="green" />
            <SummaryCard label="CGPA" value="8.75" color="blue" />
            <SummaryCard label="Pending Verifications" value="2" color="yellow" />
            <SummaryCard label="Credits Earned" value="120" color="purple" />
            <SummaryCard
              label="Hackathons Found"
              value={events.filter(e => e.type === 'hackathon').length.toString()}
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        studentId={studentId}
        mentorId={mentorId}
        studentUSN={studentUSN}
        studentEmail="" // Leave empty so student can enter their email
      />
    </div>
  );
}

// Email Modal Component
function EmailModal({ isOpen, onClose, studentId, mentorId, studentUSN, studentEmail }: {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  mentorId: string;
  studentUSN: string;
  studentEmail?: string;
}) {
  const [fromEmail, setFromEmail] = useState(studentEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ 
    type: null, 
    message: '' 
  });

  const handleSendEmail = async () => {
    if (!fromEmail.trim() || !subject.trim() || !message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('http://localhost:8000/api/email/mentee-to-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          mentorId,
          subject,
          message,
          studentEmail: fromEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Email sent successfully!' });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Mail className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Your Mentor</h2>
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

          {/* USN Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              USN
            </label>
            <input
              type="text"
              value={studentUSN}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email *
            </label>
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This email will be used for the mentor to reply to you
            </p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Character count */}
          <div className="text-right text-sm text-gray-500">
            {message.length} characters
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={loading || !fromEmail.trim() || !subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colorMap[color]} p-4 rounded-xl text-center`}>
      <p className="text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}