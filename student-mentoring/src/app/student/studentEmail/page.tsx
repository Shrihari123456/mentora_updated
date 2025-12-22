// app/student/email/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Mail, Send, Inbox, Star, StarBorder, Delete, Reply, Search,
  Refresh, ChevronLeft, Error
} from '@mui/icons-material';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,
  IconButton, Toolbar, Typography, AppBar, Badge, TextField,
  InputAdornment, Paper, Avatar, Button, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, Alert
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

interface MentorInfo {
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  mentorDept: string;
  mentorDesignation: string;
}

interface EmailStats {
  totalReceived: number;
  totalSent: number;
  unreadCount: number;
  starredCount: number;
}

interface Student {
  _id: string;
  srNo: string;
  name: string;
  email: string;
  section: string;
  admissionYear: number;
  mentor?: string;
}

export default function StudentEmailPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mentorInfo, setMentorInfo] = useState<MentorInfo | null>(null);
  const [stats, setStats] = useState<EmailStats>({
    totalReceived: 0,
    totalSent: 0,
    unreadCount: 0,
    starredCount: 0
  });
  
  const [newEmail, setNewEmail] = useState({
    subject: '',
    body: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    attachments: [] as File[]
  });

  // Get student from localStorage
  const [student, setStudent] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const drawerWidth = 280;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      const role = localStorage.getItem('role');
      const studentData = localStorage.getItem('student');
      
      console.log('🔐 Student Auth check:', { isAuth, role, hasStudentData: !!studentData });
      
      if (!isAuth || role !== 'student' || !studentData) {
        console.log('❌ Not authenticated as student, redirecting...');
        router.push('/student/login');
        return;
      }
      
      try {
        const studentObj = JSON.parse(studentData);
        console.log('✅ Authenticated as student:', studentObj.name);
        console.log('📋 Student srNo:', studentObj.srNo);
        
        setStudent(studentObj);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('❌ Error parsing student data:', err);
        router.push('/student/login');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && student?.srNo) {
      fetchEmails();
      fetchStats();
      fetchMentorInfo();
    }
  }, [student, selectedTab, isAuthenticated]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let url = '';
      
      if (selectedTab === 'inbox') {
        url = `http://localhost:8000/api/email/inbox/${student?.srNo}/student`;
      } else if (selectedTab === 'sent') {
        url = `http://localhost:8000/api/email/sent/${student?.srNo}/student`;
      } else if (selectedTab === 'starred') {
        url = `http://localhost:8000/api/email/starred/${student?.srNo}/student`;
      }
      
      console.log('📧 Fetching student emails from:', url);
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
      const url = `http://localhost:8000/api/email/stats/${student?.srNo}/student`;
      console.log('📊 Fetching student stats from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchMentorInfo = async () => {
    if (!student?.srNo) {
      console.error('❌ Cannot fetch mentor info: No student srNo');
      return;
    }

    try {
      const url = `http://localhost:8000/api/email/student-mentor/${student.srNo}`;
      console.log('👨‍🏫 Fetching mentor info from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Mentor info response:', data);
      
      if (response.ok) {
        setMentorInfo(data);
        console.log('✅ Mentor info loaded:', data.mentorName);
      } else {
        console.warn('⚠️ No mentor assigned or mentor not found');
      }
    } catch (err) {
      console.error('❌ Failed to fetch mentor info:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!mentorInfo || !student?.srNo) {
      setError('Mentor information or student not available');
      return;
    }

    try {
      const emailData = {
        senderId: student.srNo,
        senderType: 'student',
        recipientId: mentorInfo.mentorId,
        recipientType: 'mentor',
        subject: newEmail.subject,
        body: newEmail.body,
        priority: newEmail.priority,
        attachments: []
      };

      console.log('📤 Sending email from student:', emailData);
      
      const response = await fetch('http://localhost:8000/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        setComposeOpen(false);
        setNewEmail({
          subject: '',
          body: '',
          priority: 'normal',
          attachments: []
        });
        fetchEmails();
        fetchStats();
        setError(''); // Clear any previous errors
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send email');
      }
    } catch (err) {
      setError('Network error occurred');
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
          userId: student?.srNo,
          userType: 'student'
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
    localStorage.removeItem('student');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
    router.push('/student/login');
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
            <Mail sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Email
            </Typography>
          </Box>
          <IconButton onClick={handleLogout} size="small" title="Logout">
            <Typography variant="caption">Logout</Typography>
          </IconButton>
        </Toolbar>
        
        <Divider />
        
        {/* Student Info */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #eee' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mx: 'auto', 
              mb: 1,
              bgcolor: '#1976d2',
              fontSize: '1.5rem'
            }}
          >
            {student ? getInitials(student.name) : 'S'}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {student?.name || 'Student'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SR No: {student?.srNo || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Section: {student?.section || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Send />}
            onClick={() => setComposeOpen(true)}
            disabled={!mentorInfo}
            sx={{
              borderRadius: 2,
              py: 1.5,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              '&.Mui-disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {mentorInfo ? 'Compose' : 'No Mentor Assigned'}
          </Button>
          {!mentorInfo && (
            <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
              You need a mentor assigned to send emails
            </Alert>
          )}
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
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                '&:hover': { bgcolor: '#bbdefb' }
              }
            }}
          >
            <ListItemIcon>
              <Badge badgeContent={stats.unreadCount} color="error">
                <Inbox sx={{ color: selectedTab === 'inbox' ? '#1976d2' : '#757575' }} />
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
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                '&:hover': { bgcolor: '#bbdefb' }
              }
            }}
          >
            <ListItemIcon>
              <Send sx={{ color: selectedTab === 'sent' ? '#1976d2' : '#757575' }} />
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
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                '&:hover': { bgcolor: '#bbdefb' }
              }
            }}
          >
            <ListItemIcon>
              <Badge badgeContent={stats.starredCount} color="warning">
                <StarBorder sx={{ color: selectedTab === 'starred' ? '#1976d2' : '#757575' }} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Mentor Info */}
        {mentorInfo ? (
          <Box sx={{ px: 3, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
              YOUR MENTOR
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {mentorInfo.mentorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mentorInfo.mentorDesignation}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {mentorInfo.mentorDept}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              ID: {mentorInfo.mentorId}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 3, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
              MENTOR STATUS
            </Typography>
            <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
              No mentor assigned yet
            </Alert>
          </Box>
        )}
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
                      bgcolor: email.isRead ? '#fff' : '#f0f7ff',
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
                          bgcolor: email.senderType === 'mentor' ? '#1976d2' : '#4caf50'
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
                              color: email.senderType === 'mentor' ? '#1976d2' : '#2e7d32'
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
                      bgcolor: selectedEmail.senderType === 'mentor' ? '#1976d2' : '#4caf50'
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
                          color: selectedEmail.senderType === 'mentor' ? '#1976d2' : '#2e7d32'
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
                      subject: `Re: ${selectedEmail.subject}`,
                      body: `\n\nOn ${formatFullDate(selectedEmail.sentAt)}, ${selectedEmail.senderName} wrote:\n${selectedEmail.body}`,
                      priority: 'normal',
                      attachments: []
                    });
                  }}
                  disabled={!mentorInfo}
                  sx={{ 
                    bgcolor: '#1976d2', 
                    '&:hover': { bgcolor: '#1565c0' },
                    '&.Mui-disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#9e9e9e'
                    }
                  }}
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
        <DialogTitle sx={{ bgcolor: '#1976d2', color: '#fff' }}>
          New Message to Your Mentor
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {mentorInfo ? (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                To:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {mentorInfo.mentorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mentorInfo.mentorDesignation} • {mentorInfo.mentorDept}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                ID: {mentorInfo.mentorId}
              </Typography>
            </Box>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              No mentor assigned. You cannot send emails.
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Subject"
            value={newEmail.subject}
            onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
            sx={{ mb: 2 }}
            disabled={!mentorInfo}
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
                  disabled={!mentorInfo}
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
            disabled={!mentorInfo}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendEmail}
            disabled={!mentorInfo || !newEmail.subject || !newEmail.body}
            sx={{ 
              bgcolor: '#1976d2', 
              '&:hover': { bgcolor: '#1565c0' },
              '&.Mui-disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}