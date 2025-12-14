'use client';

import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import StudentChat from './StudentChat';

interface Mentor {
  _id: string;
  empId: string;
  name: string;
  email: string;
  dept?: string;
  photo?: string;
}

interface StudentChatWrapperProps {
  studentSrNo: string; // This is CA242711
  studentName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function StudentChatWrapper({ studentSrNo, studentName }: StudentChatWrapperProps) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching student data for srNo:', studentSrNo);
      
      // Fetch student by srNo
      const res = await fetch(`${API_BASE_URL}/students/srno/${studentSrNo}`);
      
      if (res.ok) {
        const student = await res.json();
        console.log('Student data received:', student);
        setStudentData(student);
        
        // Check for mentor
        if (student.mentor) {
          // Mentor is populated
          if (typeof student.mentor === 'object' && student.mentor.empId) {
            console.log('Mentor found:', student.mentor);
            setMentor({
              _id: student.mentor._id,
              empId: student.mentor.empId,
              name: student.mentor.name,
              email: student.mentor.email,
              dept: student.mentor.dept,
              photo: student.mentor.photo
            });
          }
        } else {
          console.log('No mentor assigned to this student');
        }
      } else {
        const errorText = await res.text();
        console.error('Error fetching student:', errorText);
        setError(`Student with USN "${studentSrNo}" not found.`);
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentSrNo]);

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
          Loading student data for: {studentSrNo}
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
          onClick={fetchStudentData}
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
    <Box>
      {/* Student Info */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: '#f8fafc', 
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}>
        <Typography variant="h6" color="#6366f1" gutterBottom>
          Student Information
        </Typography>
        <Typography variant="body1">
          <strong>Name:</strong> {studentData?.name || studentName}
        </Typography>
        <Typography variant="body1">
          <strong>USN:</strong> {studentSrNo}
        </Typography>
        <Typography variant="body1">
          <strong>Section:</strong> {studentData?.section || 'Not specified'}
        </Typography>
        {mentor && (
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Mentor:</strong> {mentor.name} ({mentor.empId})
          </Typography>
        )}
      </Box>
      
      <StudentChat
        // studentSrNo={studentSrNo}
        // studentName={studentData?.name || studentName}
        // mentor={mentor}
      />
    </Box>
  );
}