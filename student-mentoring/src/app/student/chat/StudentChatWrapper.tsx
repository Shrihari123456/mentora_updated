// components/StudentChatWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button, Typography, Paper, Avatar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import StudentChat from './StudentChat';

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

interface LocalStorageStudent {
  srNo: string;
  name: string;
  photo?: string;
  section: string;
}

export default function StudentChatWrapper() {
  const [studentInfo, setStudentInfo] = useState<IStudent | null>(null);
  const [mentorInfo, setMentorInfo] = useState<IMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const studentDataString = localStorage.getItem('student');
    if (studentDataString) {
      try {
        const studentData: LocalStorageStudent = JSON.parse(studentDataString);
        if (studentData && studentData.srNo) {
          fetchStudentInfo(studentData.srNo);
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

  const fetchStudentInfo = async (srNo: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_BASE_URL}/api/chat/student/${srNo}/info`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStudentInfo(data.student);
          setMentorInfo(data.mentor);
        } else {
          setError(data.message || 'Failed to load student information');
        }
      } else {
        setError('Failed to connect to server');
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const studentDataString = localStorage.getItem('student');
    if (studentDataString) {
      try {
        const studentData: LocalStorageStudent = JSON.parse(studentDataString);
        if (studentData.srNo) {
          fetchStudentInfo(studentData.srNo);
        }
      } catch (error) {
        console.error('Error parsing student data:', error);
        setError('Invalid student data in localStorage');
      }
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '600px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 3,
          bgcolor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#6366f1' }} />
        <Typography color="text.secondary">
          Loading student information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 3,
          bgcolor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          p: 3,
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Chat
        </Typography>
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%',
            maxWidth: '500px'
          }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Student and Mentor Info */}
      <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Student Info */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="#6366f1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Student Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#6366f1', width: 56, height: 56 }}>
                {studentInfo?.photo ? (
                  <img src={studentInfo.photo} alt={studentInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography sx={{ color: 'white' }}>
                    {getInitials(studentInfo?.name)}
                  </Typography>
                )}
              </Avatar>
              <Box>
                <Typography variant="h6">{studentInfo?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  SR No: {studentInfo?.srNo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Section: {studentInfo?.section}
                </Typography>
                {studentInfo?.email && (
                  <Typography variant="body2" color="text.secondary">
                    Email: {studentInfo.email}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Mentor Info */}
          {mentorInfo && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, borderLeft: { md: '1px solid #e2e8f0' }, pl: { md: 3 } }}>
              <Typography variant="h6" color="#6366f1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Assigned Mentor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', width: 56, height: 56 }}>
                  {mentorInfo.photo ? (
                    <img src={mentorInfo.photo} alt={mentorInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Typography sx={{ color: 'white' }}>
                      {getInitials(mentorInfo.name)}
                    </Typography>
                  )}
                </Avatar>
                <Box>
                  <Typography variant="h6">{mentorInfo.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emp ID: {mentorInfo.empId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Department: {mentorInfo.department || mentorInfo.dept || 'N/A'}
                  </Typography>
                  {mentorInfo.email && (
                    <Typography variant="body2" color="text.secondary">
                      Email: {mentorInfo.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {!mentorInfo && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No mentor assigned. Please contact administration for assistance.
          </Alert>
        )}
      </Paper>

      {/* Chat Component */}
      <StudentChat />
    </Box>
  );
}