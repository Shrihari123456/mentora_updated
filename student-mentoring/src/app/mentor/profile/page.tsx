// app/mentor/profile/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MentorProfile() {
  const router = useRouter();
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if mentor is logged in
    const mentor = JSON.parse(localStorage.getItem('mentor') || '{}');
    const role = localStorage.getItem('role');
    
    if (!mentor.empId || role !== 'mentor') {
      router.push('/login');
      return;
    }
    
    // Use data from localStorage or fetch fresh data
    if (mentor.empId && mentor.name) {
      setMentorData(mentor);
      setLoading(false);
    } else {
      // Fetch fresh data if needed
      fetchMentorData(mentor.empId);
    }
  }, [router]);

  const fetchMentorData = async (empId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/mentors/${empId}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMentorData(data.mentor);
          // Update localStorage with fresh data
          localStorage.setItem('mentor', JSON.stringify(data.mentor));
        } else {
          setError(data.message || 'Failed to load mentor data');
        }
      } else {
        setError('Failed to fetch mentor data');
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mentor');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
    // Clear cookies
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const handleBack = () => {
    router.push('/mentor');
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "100vh", bgcolor: "#f4f5f7" }}
      >
        <CircularProgress sx={{ color: '#3f51b5' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "100vh", bgcolor: "#f4f5f7" }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            textAlign: "center",
            borderRadius: 2,
            maxWidth: 400,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Error loading profile
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push('/mentor/dashboard')}
            sx={{ bgcolor: '#3f51b5' }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        padding: 3,
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#3f51b5",
          backgroundColor: "#ffffff",
          boxShadow: 2,
          "&:hover": {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper
        elevation={5}
        sx={{
          padding: 4,
          width: "100%",
          maxWidth: 700,
          borderRadius: 3,
          boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* Logout Button */}
        <Box
          display="flex"
          justifyContent="flex-end"
          width="100%"
          sx={{ marginBottom: 2 }}
        >
          <Button 
            variant="outlined" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
            marginBottom: 4,
          }}
        >
          Mentor Profile
        </Typography>

        {/* Profile Details */}
        {mentorData && (
          <Grid container spacing={3}>
            {[
              { label: "Name", value: mentorData.name, field: 'name' },
              { label: "Employee ID", value: mentorData.empId || mentorData.empid, field: 'empId' },
              { label: "Designation", value: mentorData.designation, field: 'designation' },
              { label: "Department", value: mentorData.dept || mentorData.department, field: 'dept' },
              { label: "Email", value: mentorData.email, field: 'email' },
              { label: "Phone", value: mentorData.phone, field: 'phone' },
              { label: "Qualification", value: mentorData.qualification, field: 'qualification' },
              { label: "Experience", value: mentorData.experience, field: 'experience' },
            ].map((field, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  label={field.label}
                  value={field.value || "Not available"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "#f9f9f9",
                      borderRadius: 2,
                    },
                    "& .MuiInputLabel-root": { fontWeight: 500 },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Additional Info */}
        {mentorData && (
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom color="#3f51b5">
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Joining"
                  value={mentorData.dateOfJoining || "Not available"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Specialization"
                  value={mentorData.specialization || "Not available"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}