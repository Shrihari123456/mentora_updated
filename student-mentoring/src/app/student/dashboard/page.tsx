'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  User, Book, Calendar, MapPin, Mail, X, Send, MessageCircle, 
  Bot, Sparkles, Code, Database, Cpu, Globe, Terminal, Zap, 
  Lightbulb, ChevronRight, Clock, Trash2, Search, AlertCircle,
  TrendingUp, Award, Brain, Rocket, HelpCircle, BookOpen,
  Upload, FileText, Paperclip, CheckCircle, Users, Home, GraduationCap, Filter
} from 'lucide-react';

import { LogOut } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  link?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  type: 'student' | 'bot';
}

interface CSEQuickPrompt {
  icon: JSX.Element;
  text: string;
  category: string;
}

interface UploadedPDF {
  id: string;
  name: string;
  size: number;
  text?: string;
  uploadedAt: Date;
}

interface StudentData {
  _id: string;
  name: string;
  srNo: string;
  email: string;
  studentEmail: string;
  phone: string;
  admissionYear: number;
  section: string;
  usn?: string;
  bloodGroup: string;
  height: number;
  weight: number;
  residentType: string;
  mentor?: string;
  dob?: Date;
  aadharNumber?: string;
  photo?: string;
  permanentAddress?: string;
  presentAddress?: string;
  hobbies?: string[];
  familyIncomeStatus?: string;
  father?: any;
  mother?: any;
  hasSiblings?: boolean;
  previousCourse?: string;
  mediumOfInstruction?: string;
}

// Search Result Interface
interface StudentSearchResult {
  _id: string;
  name: string;
  section: string;
  admissionYear: number;
  usn?: string;
  srNo: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  residentType?: string;
  permanentAddress?: string;
  presentAddress?: string;
  hobbies?: string[];
  dob?: string;
  previousCourse?: string;
  mediumOfInstruction?: string;
  hasSiblings?: boolean;
  mentor?: {
    _id: string;
    name?: string;
    email?: string;
  };
}

export default function StudentDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPDF, setUploadedPDF] = useState<UploadedPDF | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Student Search State
  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchExplanation, setSearchExplanation] = useState('');

  const studentId = studentData?._id || '';
  const mentorId = studentData?.mentor || "MNT001";
  const studentName = studentData?.name || '';
  const studentUSN = studentData?.usn || studentData?.srNo || '';
  const studentEmail = studentData?.email || studentData?.studentEmail || '';

  // CSE Quick Prompts
  const cseQuickPrompts: CSEQuickPrompt[] = [
    { icon: <Code size={16} />, text: "Explain binary search with Python code", category: "Algorithms" },
    { icon: <Database size={16} />, text: "How to normalize database to 3NF?", category: "Database" },
    { icon: <Globe size={16} />, text: "Explain TCP/IP protocol stack", category: "Networking" },
    { icon: <Terminal size={16} />, text: "Suggest a full-stack project idea", category: "Projects" },
    { icon: <Cpu size={16} />, text: "Explain polymorphism in OOP", category: "Programming" },
    { icon: <Zap size={16} />, text: "How to optimize SQL queries?", category: "Database" },
    { icon: <Brain size={16} />, text: "Explain Dijkstra's algorithm", category: "Algorithms" },
    { icon: <Rocket size={16} />, text: "Prepare me for technical interviews", category: "Career" },
    { icon: <BookOpen size={16} />, text: "Explain REST API principles", category: "Web Dev" },
    { icon: <HelpCircle size={16} />, text: "Help me debug this Python code", category: "Debugging" },
  ];

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

  const initializeChatSession = () => {
    setChatMessages([{
      id: 'welcome',
      message: '',
      response: `👋 Hello ${studentName}! I'm **CodeMentor AI**, your personal CSE assistant. I can help you with:\n\n• Programming & Algorithms\n• Database & Networking\n• Project Ideas & Debugging\n• Career Guidance & Interview Prep\n• Academic Concepts & More!\n\nWhat would you like to learn about today?`,
      timestamp: new Date(),
      type: 'bot'
    }]);
  };

  const handlePDFUpload = async (file: File) => {
    console.log('🚀 handlePDFUpload called with file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    if (!file) {
      console.error('❌ No file provided');
      alert('No file provided');
      return;
    }
    
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.error('❌ Invalid file type:', file.type);
      alert('Please upload a PDF file only (file type: ' + file.type + ')');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size, 'bytes');
      alert(`File size must be less than 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      console.log('📤 Sending FormData to backend...');
      
      const response = await fetch('http://localhost:8000/api/chatbot/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Server response data:', data);

      if (data.success) {
        console.log('🎉 PDF upload successful!');
        
        const newPDF: UploadedPDF = {
          id: `pdf_${Date.now()}`,
          name: file.name,
          size: file.size,
          text: data.data.text,
          uploadedAt: new Date()
        };
        
        setUploadedPDF(newPDF);
        
        setChatMessages(prev => [...prev, {
          id: `pdf_upload_${Date.now()}`,
          message: '',
          response: `📄 **PDF Uploaded Successfully!**\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nI've processed your PDF. You can now ask questions about its content!`,
          timestamp: new Date(),
          type: 'bot'
        }]);
        
      } else {
        console.error('❌ Server returned error:', data.message);
        alert(data.message || 'Failed to upload PDF');
      }

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
      
      setChatMessages(prev => [...prev, {
        id: `pdf_error_${Date.now()}`,
        message: '',
        response: `❌ **PDF Upload Failed**\n\nFile: ${file.name}\nError: ${error.message || 'Unknown error'}\n\nPlease try again.`,
        timestamp: new Date(),
        type: 'bot'
      }]);
      
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    const tempId = `temp_${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      message: userMessage,
      response: '',
      timestamp: new Date(),
      type: 'student'
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const requestBody: any = {
        message: userMessage,
      };

      if (uploadedPDF?.text) {
        requestBody.pdfContext = {
          text: uploadedPDF.text,
          filename: uploadedPDF.name
        };
      }

      const response = await fetch('http://localhost:8000/api/chatbot/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.success) {
        setChatMessages(prev => [
          ...prev.filter(msg => msg.id !== tempId),
          {
            id: `bot_${Date.now()}`,
            message: userMessage,
            response: data.data.response,
            timestamp: new Date(),
            type: 'bot'
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev.filter(msg => msg.id !== tempId),
          {
            id: `error_${Date.now()}`,
            message: userMessage,
            response: "⚠️ I'm having trouble processing your request. Please try again or rephrase your question.",
            timestamp: new Date(),
            type: 'bot'
          }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [
        ...prev.filter(msg => msg.id !== tempId),
        {
          id: `error_${Date.now()}`,
          message: userMessage,
          response: "🔌 Network error. Please check your connection and try again.",
          timestamp: new Date(),
          type: 'bot'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearChat = () => {
    if (confirm('Start a new conversation?')) {
      setChatMessages([]);
      setUploadedPDF(null);
      initializeChatSession();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Student Search Functions
  const handleStudentSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setSearchExplanation('');
    
    try {
      const response = await fetch('http://localhost:8000/api/report/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          studentId: studentData?._id || ''
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.students);
        setSearchExplanation(data.data.explanation);
      } else {
        alert('Search failed: ' + data.message);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error performing search');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStudentSearch();
    }
  };

  const exampleQueries = [
    { query: "students in vijayanagar", icon: <MapPin size={16} /> },
    { query: "hostel students in section A", icon: <Home size={16} /> },
    { query: "students from 2023 batch", icon: <GraduationCap size={16} /> },
    { query: "students with O+ blood group", icon: <Users size={16} /> },
    { query: "students taller than 180cm", icon: <Users size={16} /> },
    { query: "science background students", icon: <GraduationCap size={16} /> },
    { query: "students who play cricket", icon: <Users size={16} /> },
    { query: "day scholar students", icon: <Home size={16} /> },
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    fetchEvents('Bangalore');
  }, []);

  useEffect(() => {
    if (isChatModalOpen) {
      initializeChatSession();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isChatModalOpen]);

  // Dashboard Cards
  const dashboardCards = [
    {
      title: "My Details",
      description: "View and update your personal information",
      icon: <User size={24} />,
      color: "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-600",
      path: "/student/",
    },
    {
      title: "View Marks",
      description: "Check your grades and performance",
      icon: <Book size={24} />,
      color: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600",
      path: "/student/addmarks",
    },
    {
      title: "Find Students",
      description: "AI-powered search for students by location, section, etc",
      icon: <Users size={24} />,
      color: "bg-gradient-to-r from-green-100 to-emerald-50 text-green-600",
      onClick: () => setIsStudentSearchOpen(true),
    },
    {
      title: "Chat with AI",
      description: "Get instant help with CSE subjects and projects",
      icon: <Bot size={24} />,
      color: "bg-gradient-to-r from-purple-100 via-pink-100 to-purple-50 text-purple-600",
      onClick: () => setIsChatModalOpen(true),
    },
    {
      title: "Chat with Mentor",
      description: "Send and receive messages from your mentor",
      icon: <MessageCircle size={24} />,
      color: "bg-gradient-to-r from-purple-100 to-violet-50 text-purple-600",
      path: "/student/chat",
    },
    {
      title: "Meeting Schedule",
      description: "Schedule meetings with your mentor",
      icon: <Calendar size={24} />,
      color: "bg-gradient-to-r from-yellow-100 to-amber-50 text-yellow-600",
      path: "/student/request",
    },
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      style={{
        backgroundImage: `
          radial-gradient(at 40% 20%, rgba(199, 210, 254, 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(216, 180, 254, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(254, 205, 211, 0.1) 0px, transparent 50%)
        `
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">{studentName.charAt(0)}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {studentName}!
          </h1>
          <p className="text-gray-600">Computer Science Engineering • USN: <span className="font-semibold text-indigo-600">{studentUSN}</span></p>
          <div className="inline-flex items-center mt-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Active Student • Semester 5
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300 shadow-md"
          >
            <Mail size={20} />
            <span className="font-medium">Email Mentor</span>
          </button>
          
          <button
            onClick={() => setIsChatModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 shadow-md"
          >
            <Bot size={20} />
            <span className="font-medium">Ask AI Assistant</span>
          </button>
          
          <button
            onClick={() => setIsStudentSearchOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-green-200 transition-all duration-300 shadow-md"
          >
            <Users size={20} />
            <span className="font-medium">Find Students</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/student/studentevent'}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 shadow-md"
          >
            <Calendar size={20} />
            <span className="font-medium">View Events</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-2/3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search hackathons and workshops by location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition font-medium"
              >
                Search Events
              </button>
              <button
                onClick={handleUseMyLocation}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                <MapPin size={16} /> 
                <span className="hidden sm:inline">My Location</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dashboardCards.map((card, idx) => (
            <div
              key={idx}
              onClick={card.onClick || (() => window.location.href = card.path)}
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{card.title}</h2>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform" size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Academic Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Academic Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" size={24} />
                  Academic Summary
                </h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  Current Semester: 5
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-700 mb-1">8.75</div>
                  <div className="text-sm text-green-600 font-medium">CGPA</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-1">120</div>
                  <div className="text-sm text-blue-600 font-medium">Credits Earned</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-700 mb-1">2</div>
                  <div className="text-sm text-yellow-600 font-medium">Pending Verifications</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">
                    {events.filter(e => e.type === 'hackathon').length}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Hackathons</div>
                </div>
              </div>
            </div>

            {/* Upcoming Hackathons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Rocket className="text-purple-600" size={24} />
                  Upcoming Hackathons
                </h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {events.filter(e => e.type === 'hackathon').length} Events
                </span>
              </div>

              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-10 w-10 rounded-full border-4 border-purple-600 border-t-transparent"></div>
                </div>
              ) : events.filter(e => e.type === 'hackathon').length > 0 ? (
                <div className="space-y-4">
                  {events.filter(e => e.type === 'hackathon').slice(0, 3).map(event => (
                    <div
                      key={event._id}
                      onClick={() => event.link && window.open(event.link, '_blank')}
                      className="group p-4 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-700">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Calendar size={14} />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                        </div>
                        {event.link && (
                          <span className="text-purple-600 font-medium group-hover:underline">
                            Register →
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Calendar className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500">No hackathons scheduled</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => window.location.href = '/student/studentevent'}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-medium"
                >
                  View All Events
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-8">
            {/* Quick AI Prompts */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Assistant</h2>
                  <p className="text-purple-200 text-sm">Powered by Gemini AI</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-purple-200">Quick questions for your AI tutor:</p>
                {cseQuickPrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30">
                        {prompt.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{prompt.text}</p>
                        <p className="text-xs text-purple-300 mt-1">{prompt.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setIsChatModalOpen(true)}
                className="w-full py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Start AI Chat
              </button>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="text-yellow-600" size={24} />
                Recent Achievements
              </h2>
              
              <div className="space-y-3">
                {[
                  { title: "CodeWars Champion", desc: "Top 10% in coding competition", date: "2 days ago" },
                  { title: "Project Excellence", desc: "Best DBMS project in class", date: "1 week ago" },
                  { title: "Hackathon Finalist", desc: "Smart Campus Solution", date: "2 weeks ago" },
                ].map((achievement, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="text-yellow-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.desc}</p>
                    </div>
                    <span className="text-xs text-gray-500">{achievement.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal Component */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        studentId={studentId}
        mentorId={mentorId}
        studentUSN={studentUSN}
        studentEmail={studentEmail}
      />

      {/* AI Chat Modal */}
      {isChatModalOpen && (
        <ChatModal
          onClose={() => setIsChatModalOpen(false)}
          messages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onQuickPrompt={handleQuickPrompt}
          onClearChat={clearChat}
          onKeyDown={handleKeyDown}
          chatContainerRef={chatContainerRef}
          inputRef={inputRef}
          quickPrompts={cseQuickPrompts}
          studentName={studentName}
          uploadedPDF={uploadedPDF}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onPDFUpload={handlePDFUpload}
          fileInputKey={fileInputKey}
          setFileInputKey={setFileInputKey}
        />
      )}

      {/* Student Search Modal */}
      {isStudentSearchOpen && (
        <StudentSearchModal
          isOpen={isStudentSearchOpen}
          onClose={() => {
            setIsStudentSearchOpen(false);
            setSearchQuery('');
            setSearchResults([]);
            setSearchExplanation('');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchExplanation={searchExplanation}
          setSearchExplanation={setSearchExplanation}
          studentData={studentData}
          exampleQueries={exampleQueries}
          handleStudentSearch={handleStudentSearch}
          handleSearchKeyDown={handleSearchKeyDown}
        />
      )}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
              <Mail className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Your Mentor</h2>
              <p className="text-gray-600 text-sm">Get academic guidance and support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {status.type && (
            <div className={`p-4 rounded-xl ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                {status.message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USN
              </label>
              <input
                type="text"
                value={studentUSN}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this regarding?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your detailed message here..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Your mentor will reply to your email address
              </p>
              <p className="text-sm text-gray-500">
                {message.length} characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={loading || !fromEmail.trim() || !subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

// AI Chat Modal Component
function ChatModal({ 
  onClose, 
  messages, 
  chatInput, 
  setChatInput, 
  isLoading, 
  onSendMessage, 
  onQuickPrompt,
  onClearChat,
  onKeyDown,
  chatContainerRef,
  inputRef,
  quickPrompts,
  studentName,
  uploadedPDF,
  isUploading,
  uploadProgress,
  onPDFUpload,
  fileInputKey,
  setFileInputKey
}: {
  onClose: () => void;
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
  onQuickPrompt: (prompt: string) => void;
  onClearChat: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  quickPrompts: CSEQuickPrompt[];
  studentName: string;
  uploadedPDF: UploadedPDF | null;
  isUploading: boolean;
  uploadProgress: number;
  onPDFUpload: (file: File) => Promise<void>;
  fileInputKey: number;
  setFileInputKey: (key: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onPDFUpload(file);
    }
    setFileInputKey(fileInputKey + 1);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setSelectedFile(file);
      onPDFUpload(file);
    } else {
      alert('Please drop a PDF file only.');
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onPDFUpload(file);
      }
    };
    input.click();
  };

  const removePDF = () => {
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0">
      <div 
        className={`bg-gradient-to-br from-gray-900 to-black rounded-none shadow-2xl ${
          isFullScreen 
            ? 'w-screen h-screen rounded-none' 
            : 'max-w-6xl w-full h-[90vh] lg:h-[85vh] rounded-2xl'
        } transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl blur opacity-70"></div>
              <div className="relative p-2 bg-gray-900 rounded-xl border border-white/10">
                <Bot className="text-white" size={24} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                CodeMentor AI
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-xs rounded-full">
                  Beta
                </span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">Online</span>
            </div>
            
            <button
              onClick={toggleFullScreen}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
              title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
            </button>
            
            <button
              onClick={onClearChat}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-red-400"
              title="Clear chat"
            >
              <Trash2 size={20} />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {(uploadedPDF || selectedFile) && (
            <div className="px-4 py-2 border-b border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">
                    <FileText className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {uploadedPDF?.name || selectedFile?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {uploadedPDF ? 
                        `${(uploadedPDF.size / 1024 / 1024).toFixed(2)} MB • Ready` : 
                        'Processing...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removePDF}
                  className="p-1 hover:bg-white/10 rounded transition text-gray-400 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
              
              {isUploading && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-gray-900 to-black"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-8">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="relative">
                      <Bot className="text-white" size={40} />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2 text-center">
                  Hello, {studentName}! 👋
                </h1>
                <p className="text-gray-400 text-center max-w-lg mb-8">
                  I'm your AI programming assistant. I can help with code, concepts, 
                  projects, and more. Upload a PDF or start chatting!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl w-full mb-8">
                  {quickPrompts.slice(0, 6).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onQuickPrompt(prompt.text)}
                      className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-white/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg group-hover:scale-110 transition-transform">
                          {prompt.icon}
                        </div>
                        <span className="text-xs font-medium text-cyan-400">{prompt.category}</span>
                      </div>
                      <p className="text-sm text-white group-hover:text-cyan-100 transition-colors">
                        {prompt.text}
                      </p>
                    </button>
                  ))}
                </div>

                <div 
                  className={`max-w-md w-full p-8 border-2 border-dashed rounded-2xl transition-all ${
                    dragOver 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-white/20 hover:border-cyan-500/50 hover:bg-white/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full mb-4 border border-white/10">
                      <Upload className="text-cyan-400" size={24} />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Upload PDF for Context</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Lecture notes, research papers, assignments
                    </p>
                    <p className="text-xs text-gray-500">
                      Drag & drop or click to upload • Max 10MB
                    </p>
                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'student' ? (
                    <div className="max-w-[85%]">
                      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl rounded-br-none p-5 shadow-lg">
                        <p className="text-base whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%]">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl flex-shrink-0">
                          <Bot className="text-white" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">CodeMentor AI</p>
                          <p className="text-xs text-gray-500">AI Assistant</p>
                        </div>
                      </div>
                      <div className="bg-gray-800/50 border border-white/10 rounded-2xl rounded-tl-none p-5 shadow-lg">
                        <div 
                          className="prose prose-invert max-w-none text-gray-200"
                          dangerouslySetInnerHTML={{ 
                            __html: formatBotResponse(msg.response)
                          }}
                        />
                      </div>
                      <div className="flex justify-start mt-1">
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl flex-shrink-0">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">CodeMentor AI</p>
                        <p className="text-xs text-gray-500">Thinking...</p>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-white/10 rounded-2xl rounded-tl-none p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {uploadedPDF ? 'Analyzing your document...' : 'Processing your request...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 bg-gradient-to-t from-gray-900 to-black p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition disabled:opacity-50"
                >
                  <Paperclip size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-300">Upload PDF</span>
                </button>
                
                {quickPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onQuickPrompt(prompt.text)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
                  >
                    {prompt.icon}
                    <span className="text-xs text-gray-300 truncate max-w-[120px]">{prompt.text}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={
                    uploadedPDF 
                      ? `Ask questions about "${uploadedPDF.name}"...`
                      : "Message CodeMentor AI..."
                  }
                  className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-white placeholder-gray-500 resize-none text-base"
                  rows={2}
                  disabled={isLoading}
                />
                
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <button
                    onClick={onSendMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 px-1">
                <p className="text-xs text-gray-500">
                  Press ⏎ Enter to send • Free Research Preview
                </p>
                <p className="text-xs text-gray-500">
                  {chatInput.length}/2000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Search Modal Component
function StudentSearchModal({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  setSearchResults,
  isSearching,
  setIsSearching,
  searchExplanation,
  setSearchExplanation,
  studentData,
  exampleQueries,
  handleStudentSearch,
  handleSearchKeyDown
}: {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: StudentSearchResult[];
  setSearchResults: (results: StudentSearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchExplanation: string;
  setSearchExplanation: (explanation: string) => void;
  studentData: any;
  exampleQueries: { query: string; icon: JSX.Element }[];
  handleStudentSearch: () => Promise<void>;
  handleSearchKeyDown: (e: React.KeyboardEvent) => void;
}) {

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const handleExampleClick = (query: string) => {
    setSearchQuery(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Find Students</h2>
              <p className="text-gray-600 text-sm">AI-powered search across student database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search students by location, section, batch, hobbies, etc..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                  disabled={isSearching}
                />
              </div>
              <button
                onClick={handleStudentSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Example Queries */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example.query)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
                  >
                    {example.icon}
                    {example.query}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {searchExplanation && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Lightbulb size={16} />
                  <span className="font-medium">AI Interpretation</span>
                </div>
                <p className="text-blue-800">{searchExplanation}</p>
              </div>
            )}

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-600">Searching students database...</p>
                <p className="text-sm text-gray-500 mt-2">Using AI to understand your query</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Found {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {searchResults.length} results
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((student) => (
                    <div
                      key={student._id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">
                            {student.section} • Batch: {student.admissionYear}
                          </p>
                          {student.usn && (
                            <p className="text-xs text-gray-500 mt-1">USN: {student.usn}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {student.residentType && (
                          <div className="flex items-center gap-2">
                            <Home size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{student.residentType}</span>
                          </div>
                        )}

                        {student.permanentAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 line-clamp-2">
                              {student.permanentAddress}
                            </span>
                          </div>
                        )}

                        {student.bloodGroup && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Blood Group: {student.bloodGroup}</span>
                          </div>
                        )}

                        {student.height && student.weight && (
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <span>Height: {student.height}cm</span>
                            <span>Weight: {student.weight}kg</span>
                          </div>
                        )}

                        {student.hobbies && student.hobbies.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Hobbies:</p>
                            <div className="flex flex-wrap gap-1">
                              {student.hobbies.slice(0, 3).map((hobby, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {hobby}
                                </span>
                              ))}
                              {student.hobbies.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                  +{student.hobbies.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {student.previousCourse && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Previous Course:</p>
                            <p className="text-sm text-gray-700">{student.previousCourse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  No students match your search criteria. Try a different query or check your spelling.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
                  <Users className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for students</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Enter a natural language query to find students. You can search by location, section, batch, hobbies, or any other student attribute.
                </p>
                <div className="inline-grid grid-cols-2 gap-3">
                  {exampleQueries.slice(0, 4).map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(example.query)}
                      className="text-left p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {example.icon}
                        <span className="text-sm font-medium text-gray-700">Example</span>
                      </div>
                      <p className="text-gray-900 font-medium">"{example.query}"</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format bot responses
function formatBotResponse(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\n/g, '<br />')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `
        <div class="my-4 rounded-lg overflow-hidden border border-white/10">
          <div class="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10">
            <span class="text-xs font-mono text-gray-400">${language}</span>
            <button onclick="copyCode(this)" class="text-xs text-gray-400 hover:text-white transition">
              Copy
            </button>
          </div>
          <pre class="bg-gray-900 p-4 overflow-x-auto"><code class="text-sm font-mono text-gray-200">${escapeHtml(code)}</code></pre>
        </div>
      `;
    })
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-300">$1</code>')
    .replace(/\n{2,}/g, '<br /><br />');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')?.textContent === 'Copy') {
      const code = target.closest('div')?.nextElementSibling?.querySelector('code')?.textContent;
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const button = target as HTMLButtonElement;
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.classList.add('text-green-400');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('text-green-400');
          }, 2000);
        });
      }
    }
  });
}

const styles = `
  .inline-code {
    background-color: rgba(0,0,0,0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
  }
  
  code {
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}