'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSend, FiUser, FiSearch } from 'react-icons/fi';

interface Student {
  _id: string;
  name: string;
  srNo: string;
  email: string;
  photo?: string;
  section?: string;
  admissionYear?: number;
}

interface Message {
  _id?: string;
  sender: string;
  senderType: 'admin' | 'student';
  content: string;
  timestamp: string;
  read: boolean;
}

interface Chat {
  _id: string;
  participant: Student;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminStudentChat() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/admin/students`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          setFilteredStudents(data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, []);

  // Fetch existing chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/admin/chats/students`);
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };
    fetchChats();
  }, []);

  // Filter students based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.srNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Fetch messages when a student is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedStudent) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/chat/admin/student/${selectedStudent._id}/messages`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);

          // Mark messages as read
          await fetch(
            `${API_BASE_URL}/chat/admin/student/${selectedStudent._id}/read`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ readerType: 'admin' }),
            }
          );
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedStudent]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    setSending(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/admin/student/${selectedStudent._id}/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: 'admin',
            senderType: 'admin',
            content: newMessage.trim(),
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMessages(data.chat.messages);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUnreadCount = (studentId: string) => {
    const chat = chats.find((c) => c.participant._id === studentId);
    if (!chat) return 0;
    return chat.messages.filter((m) => m.senderType === 'student' && !m.read).length;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(to bottom right, rgba(249, 250, 251, 0.95), rgba(243, 244, 246, 0.95)),
          url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat with Students</h1>
            <p className="text-gray-600">Send direct messages to any student</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Student List Sidebar */}
          <div
            className={`w-80 border-r border-gray-200 flex flex-col ${
              selectedStudent ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No students found
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const unread = getUnreadCount(student._id);
                  return (
                    <div
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-4 flex items-center gap-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${
                        selectedStudent?._id === student._id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-indigo-600" />
                        </div>
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{student.srNo}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${selectedStudent ? 'flex' : 'hidden md:flex'}`}>
            {selectedStudent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="md:hidden p-1"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiUser />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStudent.name}</p>
                    <p className="text-sm opacity-90">{selectedStudent.srNo}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                  {loading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-gray-500">
                      <FiUser size={48} className="opacity-30 mb-2" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start a conversation with {selectedStudent.name}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isAdmin = msg.senderType === 'admin';
                        const showDate =
                          index === 0 ||
                          formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);

                        return (
                          <div key={msg._id || index}>
                            {showDate && (
                              <div className="text-center text-xs text-gray-500 my-4">
                                {formatDate(msg.timestamp)}
                              </div>
                            )}
                            <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                  isAdmin
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm shadow'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isAdmin ? 'text-indigo-200' : 'text-gray-400'
                                  }`}
                                >
                                  {formatTime(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <FiSend size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-gray-500">
                <FiUser size={64} className="opacity-30 mb-4" />
                <p className="text-xl">Select a student to start chatting</p>
                <p className="text-sm">Choose from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
