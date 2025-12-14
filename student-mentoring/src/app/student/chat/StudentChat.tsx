'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';

interface Message {
  _id?: string;
  sender: string;
  senderType: 'mentor' | 'student';
  content: string;
  timestamp: string | Date;
  read: boolean;
}

// HARDCODED VALUES
const STUDENT_SRNO = "CA242711";
const MENTOR_EMPID = "MNT001";
const MENTOR_NAME = "Mentor_1"; // From your MongoDB screenshot
const STUDENT_NAME = "ASHTA UBS N"; // From your MongoDB screenshot

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function StudentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatExists, setChatExists] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('Hardcoded Chat:', {
      studentSrNo: STUDENT_SRNO,
      studentName: STUDENT_NAME,
      mentorEmpId: MENTOR_EMPID,
      mentorName: MENTOR_NAME
    });
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('Fetching messages from:', `${API_BASE_URL}/messages`);
      
      const res = await fetch(`${API_BASE_URL}/messages`);
      
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Messages data:', data);
        
        if (data.success) {
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
            setChatExists(data.messages.length > 0);
          } else if (data.chat?.messages) {
            setMessages(data.chat.messages);
            setChatExists(data.chat.messages.length > 0);
          }
          
          // Mark messages as read
          try {
            await fetch(`${API_BASE_URL}/read`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ readerType: 'student' }),
            });
          } catch (readError) {
            console.log('Note: Could not mark messages as read', readError);
          }
        } else {
          setError(data.message || 'Failed to fetch messages');
        }
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        setError(`Server error: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);
    
    try {
      console.log('Sending message:', newMessage.trim());
      
      const res = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'student',
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
          setChatExists(true);
          scrollToBottom();
        } else {
          setError(data.message || 'Failed to send message');
        }
      } else {
        const errorText = await res.text();
        console.error('Send error response:', errorText);
        setError(`Failed to send message: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Create chat if it doesn't exist
  const createChat = async () => {
    try {
      setLoading(true);
      console.log('Creating chat...');
      
      const res = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'student',
          content: "Hello!",
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.chat?.messages || []);
          setChatExists(true);
          setError(null);
        } else {
          setError(data.message || 'Failed to create chat');
        }
      } else {
        const errorText = await res.text();
        setError(`Failed to create chat: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      setError('Failed to create chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMessages();
  };

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh every 5 seconds if chat exists
  useEffect(() => {
    if (!chatExists) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [chatExists, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string | Date) => {
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

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          height: '600px',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        <CircularProgress sx={{ color: '#6366f1', mb: 2 }} />
        <Typography color="text.secondary" align="center">
          Loading chat with {MENTOR_NAME}...
          <br />
          <Typography variant="caption" color="text.secondary">
            Mentor ID: {MENTOR_EMPID}
            <br />
            Student USN: {STUDENT_SRNO}
          </Typography>
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '600px',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 44,
              height: 44,
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {getInitials(MENTOR_NAME)}
          </Avatar>
          <Box>
            <Typography fontWeight={600} fontSize="1.1rem">
              {MENTOR_NAME}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              CSE • {MENTOR_EMPID}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!chatExists && (
            <Chip 
              label="Start Chat" 
              size="small" 
              sx={{ 
                bgcolor: '#10b981',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 500
              }} 
              onClick={createChat}
            />
          )}
          <IconButton 
            onClick={handleRefresh} 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
            disabled={refreshing}
          >
            {refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity={error.includes('create') || error.includes('not found') ? "info" : "error"}
          icon={error.includes('create') || error.includes('not found') ? <InfoIcon /> : <ErrorIcon />}
          sx={{ 
            mx: 2, 
            mt: 2,
            borderRadius: 2,
            '& .MuiAlert-message': { fontSize: '0.9rem' }
          }}
          onClose={() => setError(null)}
          action={
            (error.includes('create') || error.includes('not found')) && (
              <Button color="inherit" size="small" onClick={createChat}>
                Start Chat
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {/* Debug Info */}
      <Box sx={{ 
        p: 1, 
        bgcolor: '#f0f9ff', 
        textAlign: 'center',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Typography variant="caption" color="#0369a1">
          <strong>Hardcoded Chat:</strong> {STUDENT_NAME} ({STUDENT_SRNO}) ↔ {MENTOR_NAME} ({MENTOR_EMPID})
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: '#f8fafc',
          position: 'relative',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '100%',
              p: 3,
            }}
          >
            <ChatIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {chatExists ? 'No messages yet' : 'Start a conversation'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
              {chatExists 
                ? 'Send your first message to your mentor'
                : 'Click "Start Chat" above to begin chatting'}
            </Typography>
            {!chatExists && (
              <Button
                variant="contained"
                onClick={createChat}
                sx={{
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' }
                }}
              >
                Start Chat
              </Button>
            )}
          </Box>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isStudent = msg.senderType === 'student';
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].timestamp) !==
                  formatDate(msg.timestamp);

              return (
                <Box key={msg._id || index}>
                  {showDate && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        my: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2,
                          py: 0.5,
                          bgcolor: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '12px',
                          color: '#6366f1',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatDate(msg.timestamp)}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isStudent ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        px: 2,
                        maxWidth: '75%',
                        borderRadius: isStudent
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        bgcolor: isStudent ? '#6366f1' : 'white',
                        color: isStudent ? 'white' : 'text.primary',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                      elevation={0}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          wordBreak: 'break-word',
                          fontSize: '0.95rem',
                          lineHeight: 1.4
                        }}
                      >
                        {msg.content}
                      </Typography>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          opacity: 0.7,
                          color: isStudent ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
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

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          placeholder={chatExists ? "Type your message here..." : "Start by typing a message..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          variant="outlined"
          size="small"
          disabled={!chatExists}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              bgcolor: '#f5f7fb',
              '&:hover': {
                bgcolor: '#f0f2f5',
              },
              '&.Mui-focused': {
                bgcolor: 'white',
                '& fieldset': {
                  borderColor: '#6366f1 !important',
                },
              },
              '&.Mui-disabled': {
                bgcolor: '#f9fafb',
              }
            },
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending || !chatExists}
          sx={{
            bgcolor: '#6366f1',
            color: 'white',
            width: 44,
            height: 44,
            '&:hover': { 
              bgcolor: '#4f46e5',
            },
            '&:disabled': { 
              bgcolor: '#e0e0e0', 
              color: '#9e9e9e',
            },
            transition: 'all 0.2s',
          }}
        >
          {sending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}