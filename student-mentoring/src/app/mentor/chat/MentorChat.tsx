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
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';

interface Student {
  _id: string;
  name: string;
  srNo: string;
  email: string;
  photo?: string;
}

interface Message {
  _id?: string;
  sender: string;
  senderType: 'mentor' | 'student';
  content: string;
  timestamp: string;
  read: boolean;
}

interface Chat {
  _id: string;
  mentorEmpId: string;
  studentSrNo: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
}

// HARDCODED VALUES
const MENTOR_EMPID = "MNT001";
const MENTOR_NAME = "Mentor_1";
const HARDCODED_STUDENTS = [
  {
    _id: "student_ca242711",
    name: "ASHTA UBS N",
    srNo: "CA242711",
    email: "ashkharzen01@gmail.com",
    photo: ""
  }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MentorChat() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(HARDCODED_STUDENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all messages for the hardcoded chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedStudent) return;
      setLoading(true);
      try {
        console.log('Fetching messages for hardcoded chat');
        const res = await fetch(`${API_BASE_URL}/messages`);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Messages data:', data);
          
          if (data.success) {
            setMessages(data.messages || data.chat?.messages || []);
            
            // Mark messages as read
            try {
              await fetch(`${API_BASE_URL}/read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readerType: 'mentor' }),
              });
            } catch (readError) {
              console.log('Note: Could not mark messages as read', readError);
            }
          }
        } else {
          console.log('Failed to fetch messages:', res.status);
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
      console.log('Sending message as mentor');
      
      const res = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'mentor',
          content: newMessage.trim(),
        }),
      });

      console.log('Send response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Send response data:', data);
        
        if (data.success) {
          setMessages(data.chat?.messages || []);
          setNewMessage('');
          scrollToBottom();
        }
      } else {
        console.error('Failed to send message:', res.status);
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

  const getUnreadCount = () => {
    if (!messages.length) return 0;
    return messages.filter((m) => m.senderType === 'student' && !m.read).length;
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '--:--';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
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
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 100px)',
        maxHeight: '700px',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        bgcolor: 'white',
      }}
    >
      {/* Student List Sidebar */}
      <Paper
        sx={{
          width: '320px',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e0e0e0',
        }}
        elevation={0}
      >
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            <ChatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Hardcoded Chat
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Mentor: {MENTOR_NAME} ({MENTOR_EMPID})
          </Typography>
        </Box>

        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          <ListItem
            onClick={() => setSelectedStudent(HARDCODED_STUDENTS[0])}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedStudent?._id === HARDCODED_STUDENTS[0]._id
                ? 'rgba(63, 81, 181, 0.1)'
                : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.05)',
              },
              borderBottom: '1px solid #f0f0f0',
              py: 1.5,
            }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={getUnreadCount()}
                color="error"
                invisible={getUnreadCount() === 0}
              >
                <Avatar
                  src={HARDCODED_STUDENTS[0].photo}
                  sx={{ bgcolor: '#3f51b5' }}
                >
                  <PersonIcon />
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography fontWeight={getUnreadCount() > 0 ? 700 : 500}>
                  {HARDCODED_STUDENTS[0].name}
                </Typography>
              }
              secondary={HARDCODED_STUDENTS[0].srNo}
            />
          </ListItem>
          
          {/* Info Box */}
          <Box sx={{ p: 2, mt: 2, bgcolor: '#f5f7fb', borderRadius: 1, mx: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Hardcoded Chat Info:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Mentor: {MENTOR_NAME} ({MENTOR_EMPID})<br/>
              • Student: {HARDCODED_STUDENTS[0].name} ({HARDCODED_STUDENTS[0].srNo})<br/>
              • No database queries needed
            </Typography>
          </Box>
        </List>
      </Paper>

      {/* Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f7fb',
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'white',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar src={selectedStudent?.photo} sx={{ bgcolor: '#3f51b5' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography fontWeight={600}>{selectedStudent?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStudent?.srNo}
            </Typography>
            <Typography variant="caption" color="#3f51b5">
              Hardcoded chat • Mentor: {MENTOR_EMPID}
            </Typography>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <ChatIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography>No messages yet</Typography>
              <Typography variant="body2">
                Start a conversation with {selectedStudent?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Using hardcoded chat between {MENTOR_EMPID} and {selectedStudent?.srNo}
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isMentor = msg.senderType === 'mentor';
                const showDate =
                  index === 0 ||
                  formatDate(messages[index - 1].timestamp) !==
                    formatDate(msg.timestamp);

                return (
                  <Box key={msg._id || index}>
                    {showDate && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          color: 'text.secondary',
                          my: 2,
                        }}
                      >
                        {formatDate(msg.timestamp)}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isMentor ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          px: 2,
                          maxWidth: '70%',
                          borderRadius: isMentor
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          bgcolor: isMentor ? '#3f51b5' : 'white',
                          color: isMentor ? 'white' : 'text.primary',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                        elevation={0}
                      >
                        {!isMentor && (
                          <Typography variant="caption" sx={{ color: '#3f51b5', fontWeight: 500, display: 'block', mb: 0.5 }}>
                            {selectedStudent?.name}
                          </Typography>
                        )}
                        {isMentor && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, display: 'block', mb: 0.5 }}>
                            {MENTOR_NAME}
                          </Typography>
                        )}
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            opacity: 0.7,
                          }}
                        >
                          {formatTime(msg.timestamp)}
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

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'white',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                bgcolor: '#f5f7fb',
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            sx={{
              bgcolor: '#3f51b5',
              color: 'white',
              '&:hover': { bgcolor: '#303f9f' },
              '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
            }}
          >
            {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}