// components/MentorChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatIcon from '@mui/icons-material/Chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// TypeScript Interfaces
interface IStudent {
  _id: string;
  srNo: string;
  name: string;
  email?: string;
  section: string;
  photo?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
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

interface LocalStorageMentor {
  empId: string;
  name: string;
  department?: string;
  dept?: string;
}

export default function MentorChat() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentorInfo, setMentorInfo] = useState<IMentor | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get mentor data from localStorage
  useEffect(() => {
    const mentorDataString = localStorage.getItem('mentor');
    if (mentorDataString) {
      try {
        const mentorData: LocalStorageMentor = JSON.parse(mentorDataString);
        if (mentorData && mentorData.empId) {
          const mentorInfoObj: IMentor = {
            _id: '',
            empId: mentorData.empId,
            name: mentorData.name || '',
            department: mentorData.department || mentorData.dept || '',
            dept: mentorData.department || mentorData.dept || '',
          };
          setMentorInfo(mentorInfoObj);
          fetchMentorStudents(mentorData.empId);
        } else {
          setError('Invalid mentor data in localStorage');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing mentor data:', error);
        setError('Invalid mentor data in localStorage');
        setLoading(false);
      }
    } else {
      setError('No mentor data found. Please login again.');
      setLoading(false);
    }
  }, []);

  const fetchMentorStudents = async (empId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/mentor/${empId}/students`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.mentor) {
            setMentorInfo(data.mentor);
          }
          
          const typedStudents: IStudent[] = (data.students || []).map((student: any) => ({
            _id: student._id || student.id || Math.random().toString(),
            srNo: student.srNo || '',
            name: student.name || '',
            email: student.email || '',
            section: student.section || '',
            photo: student.photo,
            lastMessage: student.lastMessage,
            lastMessageTime: student.lastMessageTime,
            unreadCount: student.unreadCount || 0,
          }));
          
          setStudents(typedStudents);
          if (typedStudents.length > 0) {
            setSelectedStudent(typedStudents[0]);
          }
        } else {
          setError(data.message || 'Failed to load students');
        }
      } else {
        setError('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedStudent || !mentorInfo?.empId) return;

    try {
      const url = `${API_BASE_URL}/api/chat/messages?role=mentor&empId=${mentorInfo.empId}&studentSrNo=${selectedStudent.srNo}`;
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
    if (!selectedStudent || !mentorInfo?.empId) return;

    try {
      await fetch(`${API_BASE_URL}/api/chat/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'mentor',
          studentSrNo: selectedStudent.srNo,
          mentorEmpId: mentorInfo.empId
        }),
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  useEffect(() => {
    if (selectedStudent && mentorInfo?.empId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent, mentorInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !mentorInfo?.empId) return;

    setSending(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'mentor',
          empId: mentorInfo.empId,
          studentSrNo: selectedStudent.srNo,
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
          
          if (mentorInfo.empId) {
            setTimeout(() => fetchMentorStudents(mentorInfo.empId), 500);
          }
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
    if (mentorInfo?.empId) {
      setRefreshing(true);
      fetchMentorStudents(mentorInfo.empId);
    }
  };

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

  const getLastMessageTime = (student: IStudent) => {
    if (!student.lastMessageTime) return '';
    const date = new Date(student.lastMessageTime);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatTime(student.lastMessageTime);
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderRadius: 3 }}>
        <CircularProgress sx={{ color: '#3f51b5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '700px', borderRadius: 3, overflow: 'hidden', boxShadow: 3, bgcolor: 'white' }}>
      {/* Sidebar */}
      <Paper sx={{ width: '320px', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }} elevation={0}>
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                <ChatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                My Students
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Mentor: {mentorInfo?.name} ({mentorInfo?.empId})
              </Typography>
            </Box>
            <IconButton onClick={handleRefresh} sx={{ color: 'white' }} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {students.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <ChatIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">No students assigned</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                You don't have any assigned students yet.
              </Typography>
            </Box>
          ) : (
            students.map((student) => (
              <ListItem
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedStudent?._id === student._id ? 'rgba(63, 81, 181, 0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.05)' },
                  borderBottom: '1px solid #f0f0f0',
                  py: 1.5,
                }}
              >
                <ListItemAvatar>
                  <Badge badgeContent={student.unreadCount} color="error">
                    <Avatar 
                      src={student.photo} 
                      sx={{ bgcolor: '#3f51b5', width: 44, height: 44 }}
                    >
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Typography sx={{ color: 'white' }}>
                          {getInitials(student.name)}
                        </Typography>
                      )}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography fontWeight={selectedStudent?._id === student._id ? 600 : 400}>
                        {student.name}
                      </Typography>
                      {student.lastMessageTime && (
                        <Typography variant="caption" color="text.secondary">
                          {getLastMessageTime(student)}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {student.srNo} • {student.section}
                      </Typography>
                      {student.lastMessage && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {student.lastMessage}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fb' }}>
        {!selectedStudent ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', p: 3 }}>
            <ChatIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">Select a student to start chatting</Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Choose a student from the list on the left
              <br />
              to begin your conversation
            </Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={selectedStudent.photo} 
                sx={{ bgcolor: '#3f51b5', width: 48, height: 48 }}
              >
                {selectedStudent.photo ? (
                  <img src={selectedStudent.photo} alt={selectedStudent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography sx={{ color: 'white' }}>
                    {getInitials(selectedStudent.name)}
                  </Typography>
                )}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600} variant="h6">
                  {selectedStudent.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent.srNo} • {selectedStudent.section}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedStudent.email}
                </Typography>
              </Box>
              {selectedStudent.unreadCount && selectedStudent.unreadCount > 0 && (
                <Chip 
                  label={`${selectedStudent.unreadCount} new`} 
                  color="error" 
                  size="small"
                />
              )}
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary', p: 3 }}>
                  <ChatIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6">No messages yet</Typography>
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    Start a conversation with {selectedStudent.name}
                    <br />
                    Send your first message below
                  </Typography>
                </Box>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isMentor = msg.senderType === 'mentor';
                    const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);

                    return (
                      <Box key={msg._id || index}>
                        {showDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <Chip label={formatDate(msg.timestamp)} size="small" sx={{ bgcolor: '#e8eaf6', color: '#3f51b5' }} />
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: isMentor ? 'flex-end' : 'flex-start' }}>
                          <Paper sx={{ 
                            p: 1.5, 
                            px: 2, 
                            maxWidth: '70%', 
                            borderRadius: isMentor ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                            bgcolor: isMentor ? '#3f51b5' : 'white', 
                            color: isMentor ? 'white' : 'text.primary',
                            boxShadow: 1
                          }}>
                            <Typography variant="body1">{msg.content}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                              {formatTime(msg.timestamp)}
                              {!isMentor && !msg.read && ' • Unread'}
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
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder={`Type a message to ${selectedStudent?.name || 'student'}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                multiline
                maxRows={3}
                disabled={sending}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '24px', 
                    bgcolor: '#f5f7fb' 
                  } 
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                sx={{ 
                  bgcolor: '#3f51b5', 
                  color: 'white', 
                  width: 48, 
                  height: 48,
                  '&:hover': { bgcolor: '#303f9f' }, 
                  '&:disabled': { bgcolor: '#e0e0e0' } 
                }}
              >
                {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}