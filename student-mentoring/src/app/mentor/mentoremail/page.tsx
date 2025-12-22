// app/mentor/email/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Mail, Send, Inbox, Star, StarBorder, Delete, Reply, Search,
  Refresh, ChevronLeft, AttachFile, Error, People
} from '@mui/icons-material';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,
  IconButton, Toolbar, Typography, AppBar, Badge, TextField,
  InputAdornment, Paper, Avatar, Button, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  Alert, Autocomplete
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface Email {
  _id: string;
  subject: string;
  body: string;
  senderName: string;
  senderType: 'student' | 'mentor';
  senderId: string;
  recipientName: string;
  recipientType: 'student' | 'mentor';
  recipientId: string;
  isRead: boolean;
  isStarred: boolean;
  priority: 'low' | 'normal' | 'high';
  labels: string[];
  sentAt: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
}

interface Student {
  _id: string;
  srNo: string;
  name: string;
  email: string;
  section: string;
  admissionYear: number;
}

interface EmailStats {
  totalReceived: number;
  totalSent: number;
  unreadCount: number;
  starredCount: number;
}

interface Mentor {
  _id: string;
  empId: string;
  name: string;
  email: string;
  dept: string;
  designation: string;
  phone: string;
  students: string[];
}

export default function MentorEmailPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<EmailStats>({
    totalReceived: 0,
    totalSent: 0,
    unreadCount: 0,
    starredCount: 0
  });
  
  const [newEmail, setNewEmail] = useState({
    recipientId: '',
    recipientName: '',
    subject: '',
    body: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    attachments: [] as File[],
    sendToAll: false
  });

  // Get mentor from localStorage
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const drawerWidth = 280;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      const role = localStorage.getItem('role');
      const mentorData = localStorage.getItem('mentor');
      
      console.log('🔐 Auth check:', { isAuth, role, hasMentorData: !!mentorData });
      
      if (!isAuth || role !== 'mentor' || !mentorData) {
        console.log('❌ Not authenticated as mentor, redirecting...');
        router.push('/mentor/login');
        return;
      }
      
      try {
        const mentorObj = JSON.parse(mentorData);
        console.log('✅ Authenticated as mentor:', mentorObj.name);
        console.log('📋 Mentor empId:', mentorObj.empId);
        
        setMentor(mentorObj);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('❌ Error parsing mentor data:', err);
        router.push('/mentor/login');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && mentor?.empId) {
      fetchEmails();
      fetchStats();
      fetchStudents();
    }
  }, [mentor, selectedTab, isAuthenticated]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let url = '';
      
      if (selectedTab === 'inbox') {
        url = `http://localhost:8000/api/email/inbox/${mentor?.empId}/mentor`;
      } else if (selectedTab === 'sent') {
        url = `http://localhost:8000/api/email/sent/${mentor?.empId}/mentor`;
      } else if (selectedTab === 'starred') {
        url = `http://localhost:8000/api/email/starred/${mentor?.empId}/mentor`;
      }
      
      console.log('📧 Fetching emails from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setEmails(data.emails || []);
      } else {
        setError(data.message || 'Failed to fetch emails');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const url = `http://localhost:8000/api/email/stats/${mentor?.empId}/mentor`;
      console.log('📊 Fetching stats from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchStudents = async () => {
    if (!mentor?.empId) {
      console.error('❌ Cannot fetch students: No empId');
      setError('Mentor ID not found');
      return;
    }

    try {
      console.log('👨‍🏫 Fetching students for mentor empId:', mentor.empId);
      
      // Try the new route first (mentor-students)
      const url = `http://localhost:8000/api/email/mentor-students/${mentor.empId}`;
      console.log('📡 Calling URL:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      
      console.log('📥 Raw response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('❌ Failed to parse JSON:', parseErr);
        console.log('Raw response that failed to parse:', text);
        
        // If route doesn't exist, try alternative
        await tryAlternativeStudentFetch();
        return;
      }
      
      console.log('✅ Parsed response:', data);
      
      if (response.ok) {
        console.log('🎯 Students data received:', data.students);
        setStudents(data.students || []);
        
        if (!data.students || data.students.length === 0) {
          console.warn('⚠️ No students found in response');
        }
      } else {
        console.error('❌ API Error:', data);
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Failed to fetch students - Network error');
    }
  };

  const tryAlternativeStudentFetch = async () => {
    console.log('🔄 Trying alternative student fetch method...');
    
    if (!mentor?._id) {
      console.error('❌ No mentor _id available for alternative fetch');
      return;
    }
    
    try {
      // Try to get mentor with populated students
      const mentorUrl = `http://localhost:8000/api/mentors/${mentor._id}`;
      console.log('🔄 Trying mentor URL:', mentorUrl);
      
      const mentorResponse = await fetch(mentorUrl);
      if (mentorResponse.ok) {
        const mentorData = await mentorResponse.json();
        console.log('📋 Mentor with students:', mentorData);
        
        if (mentorData.mentor?.students) {
          // If students are just IDs, fetch each student
          const studentPromises = mentorData.mentor.studentIds.map((studentId: string) => 
            fetch(`http://localhost:8000/api/students/${studentId}`)
          );
          
          const studentResponses = await Promise.all(studentPromises);
          const studentData = await Promise.all(
            studentResponses.map(res => res.ok ? res.json() : null)
          );
          
          const validStudents = studentData
            .filter(s => s && s.student)
            .map(s => ({
              _id: s.student._id,
              srNo: s.student.srNo,
              name: s.student.name,
              email: s.student.email,
              section: s.student.section,
              admissionYear: s.student.admissionYear
            }));
          
          setStudents(validStudents);
        }
      }
    } catch (err) {
      console.error('❌ Alternative fetch failed:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!mentor?.empId) {
      setError('Mentor not authenticated');
      return;
    }

    try {
      const recipients = newEmail.sendToAll 
        ? students.map(s => ({
            recipientId: s.srNo,
            recipientName: s.name
          }))
        : [{
            recipientId: newEmail.recipientId,
            recipientName: newEmail.recipientName
          }];

      console.log('📤 Sending email to recipients:', recipients);
      
      for (const recipient of recipients) {
        const emailData = {
          senderId: mentor.empId,
          senderType: 'mentor',
          recipientId: recipient.recipientId,
          recipientType: 'student',
          subject: newEmail.subject,
          body: newEmail.body,
          priority: newEmail.priority,
          attachments: []
        };

        console.log('📝 Email data:', emailData);
        
        const response = await fetch('http://localhost:8000/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }
      }

      setComposeOpen(false);
      setNewEmail({
        recipientId: '',
        recipientName: '',
        subject: '',
        body: '',
        priority: 'normal',
        attachments: [],
        sendToAll: false
      });
      
      // Refresh data
      fetchEmails();
      fetchStats();
      
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to send email');
      console.error(err);
    }
  };

  const handleMarkAsRead = async (emailId: string, isRead: boolean) => {
    try {
      const response = await fetch(`http://localhost:8000/api/email/${emailId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      });

      if (response.ok) {
        fetchEmails();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to mark email:', err);
    }
  };

  const handleToggleStar = async (emailId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/email/${emailId}/star`, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchEmails();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/email/${emailId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mentor?.empId,
          userType: 'mentor'
        })
      });

      if (response.ok) {
        setSelectedEmail(null);
        fetchEmails();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'low': return '#44b7ff';
      default: return 'transparent';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('mentor');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
    router.push('/mentor/login');
  };

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Checking authentication...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#fff'
          },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Mail sx={{ mr: 2, color: '#d32f2f' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Email
            </Typography>
          </Box>
          <IconButton onClick={handleLogout} size="small" title="Logout">
            <Typography variant="caption">Logout</Typography>
          </IconButton>
        </Toolbar>
        
        <Divider />
        
        {/* Mentor Info */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #eee' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mx: 'auto', 
              mb: 1,
              bgcolor: '#d32f2f',
              fontSize: '1.5rem'
            }}
          >
            {mentor ? getInitials(mentor.name) : 'M'}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {mentor?.name || 'Mentor'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {mentor?.designation || 'Mentor'} • {mentor?.dept || 'Department'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ID: {mentor?.empId || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Send />}
            onClick={() => setComposeOpen(true)}
            sx={{
              borderRadius: 2,
              py: 1.5,
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#c62828' }
            }}
          >
            Compose
          </Button>
        </Box>

        <List>
          <ListItem
            button
            selected={selectedTab === 'inbox'}
            onClick={() => setSelectedTab('inbox')}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: '#ffebee',
                color: '#d32f2f',
                '&:hover': { bgcolor: '#ffcdd2' }
              }
            }}
          >
            <ListItemIcon>
              <Badge badgeContent={stats.unreadCount} color="error">
                <Inbox sx={{ color: selectedTab === 'inbox' ? '#d32f2f' : '#757575' }} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Inbox" />
            <Typography variant="body2" color="text.secondary">
              {stats.totalReceived}
            </Typography>
          </ListItem>

          <ListItem
            button
            selected={selectedTab === 'sent'}
            onClick={() => setSelectedTab('sent')}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: '#ffebee',
                color: '#d32f2f',
                '&:hover': { bgcolor: '#ffcdd2' }
              }
            }}
          >
            <ListItemIcon>
              <Send sx={{ color: selectedTab === 'sent' ? '#d32f2f' : '#757575' }} />
            </ListItemIcon>
            <ListItemText primary="Sent" />
            <Typography variant="body2" color="text.secondary">
              {stats.totalSent}
            </Typography>
          </ListItem>

          <ListItem
            button
            selected={selectedTab === 'starred'}
            onClick={() => setSelectedTab('starred')}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: '#ffebee',
                color: '#d32f2f',
                '&:hover': { bgcolor: '#ffcdd2' }
              }
            }}
          >
            <ListItemIcon>
              <Badge badgeContent={stats.starredCount} color="warning">
                <StarBorder sx={{ color: selectedTab === 'starred' ? '#d32f2f' : '#757575' }} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem>

          <ListItem
            button
            onClick={() => {
              setComposeOpen(true);
              setNewEmail(prev => ({ ...prev, sendToAll: true }));
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <ListItemIcon>
              <People sx={{ color: '#757575' }} />
            </ListItemIcon>
            <ListItemText primary="Email All Students" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ px: 3, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            YOUR STUDENTS
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="#d32f2f" sx={{ fontWeight: 600 }}>
              {students.length} Students
            </Typography>
            <Button 
              size="small" 
              onClick={fetchStudents}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Box>
          
          {students.length === 0 && (
            <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
              No students found. Click Refresh or check console.
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
              {error}
            </Alert>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: '#fff', 
            borderBottom: '1px solid #e0e0e0',
            color: '#333'
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {selectedTab === 'inbox' ? 'Inbox' : 
               selectedTab === 'sent' ? 'Sent Mail' : 
               'Starred'}
            </Typography>

            <TextField
              size="small"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                mr: 2, 
                width: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <IconButton onClick={fetchEmails} title="Refresh">
              <Refresh />
            </IconButton>
            {selectedEmail && (
              <IconButton onClick={() => setSelectedEmail(null)} title="Back">
                <ChevronLeft />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          {!selectedEmail && (
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              bgcolor: '#fff'
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
              ) : filteredEmails.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <Mail sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No emails found
                  </Typography>
                </Box>
              ) : (
                filteredEmails.map((email) => (
                  <Paper
                    key={email._id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderBottom: '1px solid #e0e0e0',
                      borderLeft: `4px solid ${getPriorityColor(email.priority)}`,
                      bgcolor: email.isRead ? '#fff' : '#fff3e0',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => {
                      setSelectedEmail(email);
                      if (!email.isRead && selectedTab === 'inbox') {
                        handleMarkAsRead(email._id, true);
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          bgcolor: email.senderType === 'mentor' ? '#2196f3' : '#4caf50'
                        }}
                      >
                        {getInitials(email.senderName)}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: email.isRead ? 400 : 600,
                              mr: 1
                            }}
                          >
                            {email.senderName}
                          </Typography>
                          <Chip 
                            label={email.senderType === 'mentor' ? 'Mentor' : 'Student'} 
                            size="small" 
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: email.senderType === 'mentor' ? '#e3f2fd' : '#e8f5e9',
                              color: email.senderType === 'mentor' ? '#1565c0' : '#2e7d32'
                            }} 
                          />
                          {email.priority === 'high' && (
                            <Error sx={{ fontSize: 16, color: '#ff4444', ml: 0.5 }} />
                          )}
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: email.isRead ? 400 : 500,
                            mb: 0.5
                          }}
                        >
                          {email.subject}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {email.body}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right', ml: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDate(email.sentAt)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(email._id);
                          }}
                          sx={{ mt: 0.5 }}
                        >
                          {email.isStarred ? (
                            <Star sx={{ color: '#ffb74d', fontSize: 18 }} />
                          ) : (
                            <StarBorder sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          )}

          {selectedEmail && (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: '#fff'
            }}>
              <Paper elevation={0} sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedEmail.subject}
                  </Typography>
                  <Box>
                    <IconButton onClick={() => handleToggleStar(selectedEmail._id)} title="Star">
                      {selectedEmail.isStarred ? (
                        <Star sx={{ color: '#ffb74d' }} />
                      ) : (
                        <StarBorder />
                      )}
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEmail(selectedEmail._id)} title="Delete">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      mr: 2,
                      bgcolor: selectedEmail.senderType === 'mentor' ? '#2196f3' : '#4caf50'
                    }}
                  >
                    {getInitials(selectedEmail.senderName)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {selectedEmail.senderName}
                      </Typography>
                      <Chip 
                        label={selectedEmail.senderType === 'mentor' ? 'Mentor' : 'Student'}
                        size="small"
                        sx={{ 
                          mr: 1,
                          bgcolor: selectedEmail.senderType === 'mentor' ? '#e3f2fd' : '#e8f5e9',
                          color: selectedEmail.senderType === 'mentor' ? '#1565c0' : '#2e7d32'
                        }}
                      />
                      {selectedEmail.priority === 'high' && (
                        <Chip 
                          label="High Priority" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#ffebee',
                            color: '#c62828'
                          }} 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatFullDate(selectedEmail.sentAt)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ 
                flexGrow: 1, 
                p: 3, 
                overflow: 'auto'
              }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedEmail.body}
                </Typography>
              </Box>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  gap: 1
                }}
              >
                <Button 
                  variant="contained" 
                  startIcon={<Reply />}
                  onClick={() => {
                    setComposeOpen(true);
                    setNewEmail({
                      recipientId: selectedEmail.senderId,
                      recipientName: selectedEmail.senderName,
                      subject: `Re: ${selectedEmail.subject}`,
                      body: `\n\nOn ${formatFullDate(selectedEmail.sentAt)}, ${selectedEmail.senderName} wrote:\n${selectedEmail.body}`,
                      priority: 'normal',
                      attachments: [],
                      sendToAll: false
                    });
                  }}
                  sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#c62828' } }}
                >
                  Reply
                </Button>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      {/* Compose Dialog */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#d32f2f', color: '#fff' }}>
          {newEmail.sendToAll ? 'Email All Students' : 'New Message'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {!newEmail.sendToAll ? (
            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.name} (${option.srNo}) - ${option.section}`}
              value={students.find(s => s.srNo === newEmail.recipientId) || null}
              onChange={(_, newValue) => {
                setNewEmail({
                  ...newEmail,
                  recipientId: newValue?.srNo || '',
                  recipientName: newValue?.name || ''
                });
              }}
              isOptionEqualToValue={(option, value) => option.srNo === value.srNo}
              onOpen={() => {
                console.log('📖 Dropdown opened, checking if we need to fetch students...');
                if (students.length === 0) {
                  console.log('📥 No students loaded, fetching now...');
                  fetchStudents();
                }
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Student"
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              noOptionsText={
                loading 
                  ? "Loading students..." 
                  : students.length === 0 
                    ? "No students found. Click to refresh or check connection."
                    : "No matching students found"
              }
            />
          ) : (
            <Box sx={{ mb: 2 }}>
              <Alert severity="info">
                This email will be sent to all {students.length} of your students.
              </Alert>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Subject"
            value={newEmail.subject}
            onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Priority:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['low', 'normal', 'high'] as const).map((priority) => (
                <Chip
                  key={priority}
                  label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                  onClick={() => setNewEmail({...newEmail, priority})}
                  color={newEmail.priority === priority ? 'primary' : 'default'}
                  variant={newEmail.priority === priority ? 'filled' : 'outlined'}
                  sx={{ 
                    bgcolor: newEmail.priority === priority ? '#d32f2f' : undefined,
                    '&:hover': { bgcolor: newEmail.priority === priority ? '#c62828' : undefined }
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Message"
            multiline
            rows={10}
            value={newEmail.body}
            onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setComposeOpen(false);
            setNewEmail({
              recipientId: '',
              recipientName: '',
              subject: '',
              body: '',
              priority: 'normal',
              attachments: [],
              sendToAll: false
            });
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendEmail}
            disabled={!newEmail.sendToAll && (!newEmail.recipientId || !newEmail.subject || !newEmail.body)}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#c62828' } }}
          >
            {newEmail.sendToAll ? 'Send to All' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}