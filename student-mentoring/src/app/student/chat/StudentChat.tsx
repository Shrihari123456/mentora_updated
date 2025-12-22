// components/StudentChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Badge,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// TypeScript Interfaces
interface IStudent {
  _id: string;
  srNo: string;
  name: string;
  email?: string;
  section: string;
  photo?: string;
}

interface IMentor {
  _id: string;
  empId: string;
  name: string;
  department?: string;
  dept?: string;
  email?: string;
  phone?: string;
  photo?: string;
  designation?: string;
}

interface IMessage {
  _id: string;
  content: string;
  senderType: 'student' | 'mentor';
  timestamp: string;
  read: boolean;
}

interface LocalStorageStudent {
  srNo: string;
  name: string;
  photo?: string;
  section: string;
}

export default function StudentChat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<IStudent | null>(null);
  const [mentorInfo, setMentorInfo] = useState<IMentor | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const studentDataString = localStorage.getItem('student');
    if (studentDataString) {
      try {
        const studentData: LocalStorageStudent = JSON.parse(studentDataString);
        if (studentData && studentData.srNo) {
          const studentInfoObj: IStudent = {
            _id: '',
            srNo: studentData.srNo,
            name: studentData.name || '',
            email: '',
            section: studentData.section || '',
            photo: studentData.photo,
          };
          setStudentInfo(studentInfoObj);
          fetchStudentChatInfo(studentData.srNo);
        } else {
          setError('Invalid student data in localStorage');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing student data:', error);
        setError('Invalid student data in localStorage');
        setLoading(false);
      }
    } else {
      setError('No student data found. Please login again.');
      setLoading(false);
    }
  }, []);

  const fetchStudentChatInfo = async (srNo: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/student/${srNo}/info`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.student) {
            setStudentInfo(data.student);
          }
          
          if (data.mentor) {
            setMentorInfo(data.mentor);
          }
          
          if (data.chat) {
            setUnreadCount(data.chat.unreadCount || 0);
            if (data.mentor) {
              fetchMessages();
            }
          }
        } else {
          setError(data.message || 'Failed to load chat info');
        }
      }
    } catch (error) {
      console.error('Error fetching chat info:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!studentInfo?.srNo) return;

    try {
      const url = `${API_BASE_URL}/api/chat/messages?role=student&srNo=${studentInfo.srNo}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const typedMessages: IMessage[] = (data.messages || []).map((msg: any) => ({
            _id: msg._id || msg.id || Math.random().toString(),
            content: msg.content || '',
            senderType: msg.senderType || 'student',
            timestamp: msg.timestamp || new Date().toISOString(),
            read: msg.read || false,
          }));
          
          setMessages(typedMessages);
          
          if (typedMessages.length > 0) {
            await markMessagesAsRead();
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!studentInfo?.srNo || !mentorInfo?.empId) return;

    try {
      await fetch(`${API_BASE_URL}/api/chat/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          studentSrNo: studentInfo.srNo,
          mentorEmpId: mentorInfo.empId
        }),
      });
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !studentInfo?.srNo) return;

    setSending(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          srNo: studentInfo.srNo,
          content: newMessage.trim()
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const typedMessages: IMessage[] = (data.chat?.messages || []).map((msg: any) => ({
            _id: msg._id || msg.id || Math.random().toString(),
            content: msg.content || '',
            senderType: msg.senderType || 'student',
            timestamp: msg.timestamp || new Date().toISOString(),
            read: msg.read || false,
          }));
          
          setMessages(typedMessages);
          setNewMessage('');
          scrollToBottom();
          
          setTimeout(fetchMessages, 500);
        } else {
          setError(data.message || 'Failed to send message');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Network error');
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = () => {
    if (studentInfo?.srNo) {
      fetchStudentChatInfo(studentInfo.srNo);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (mentorInfo?.empId) {
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [mentorInfo]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading && !mentorInfo) {
    return (
      <Box sx={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderRadius: 3 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!mentorInfo) {
    return (
      <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderRadius: 3, p: 3 }}>
        <ChatIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Mentor Assigned
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          You don't have an assigned mentor yet.
          <br />
          Please contact administration for assistance.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          Student: {studentInfo?.name} ({studentInfo?.srNo})
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px', borderRadius: 3, overflow: 'hidden', boxShadow: 3, bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
              {mentorInfo.photo ? (
                <img src={mentorInfo.photo} alt={mentorInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Typography sx={{ color: 'white' }}>
                  {getInitials(mentorInfo.name)}
                </Typography>
              )}
            </Avatar>
          </Badge>
          <Box>
            <Typography fontWeight={600} fontSize="1.1rem">
              {mentorInfo.name}
              {unreadCount > 0 && (
                <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', opacity: 0.9 }}>
                  ({unreadCount} new)
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {mentorInfo.department || mentorInfo.dept || 'Department'} • {mentorInfo.empId}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
              Student: {studentInfo?.name} ({studentInfo?.srNo})
            </Typography>
          </Box>
        </Box>
        
        <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#f8fafc' }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <ChatIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No messages yet</Typography>
            <Typography variant="body2" color="text.secondary">Start your conversation with your mentor!</Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isStudent = msg.senderType === 'student';
              const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);

              return (
                <Box key={msg._id || index}>
                  {showDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <Chip label={formatDate(msg.timestamp)} size="small" sx={{ bgcolor: '#e0e7ff', color: '#6366f1' }} />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: isStudent ? 'flex-end' : 'flex-start', mb: 1 }}>
                    <Paper sx={{ 
                      p: 1.5, 
                      px: 2, 
                      maxWidth: '75%', 
                      borderRadius: isStudent ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                      bgcolor: isStudent ? '#6366f1' : 'white', 
                      color: isStudent ? 'white' : 'text.primary',
                      boxShadow: 1
                    }}>
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                        {formatTime(msg.timestamp)}
                        {!isStudent && !msg.read && ' • Unread'}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          multiline
          maxRows={4}
          variant="outlined"
          size="small"
          disabled={sending}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          sx={{ bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#4f46e5' }, '&:disabled': { bgcolor: '#e0e0e0' } }}
        >
          {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}