'use client';

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";

interface LoginFormValues {
  role: "mentor" | "student" | "admin";
  userid: string;
  password: string;
}

const LoginScreen = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    defaultValues: { role: "student", userid: "", password: "" },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const role = watch("role");

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let endpoint = '';
      let requestData = {};
      
      // Different endpoints based on role
      const API_BASE_URL = 'http://localhost:8000/api';
      
      if (data.role === "student") {
        endpoint = `${API_BASE_URL}/students/login`;
        requestData = {
          srNo: data.userid,
          password: data.password
        };
      } else if (data.role === "mentor") {
        endpoint = `${API_BASE_URL}/mentors/login`;
        requestData = {
          empId: data.userid,
          password: data.password
        };
      } else if (data.role === "admin") {
        endpoint = `${API_BASE_URL}/admin/login`;
        requestData = {
          adminId: data.userid,
          password: data.password
        };
      }
  
      console.log('Calling API:', endpoint, 'with data:', requestData);
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `HTTP error! status: ${response.status}`);
        } catch {
          throw new Error(`Login failed with status: ${response.status}`);
        }
      }
  
      const result = await response.json();
      console.log('Login response:', result);
  
      // if (!result.success) {
      //   throw new Error(result.message || 'Login failed');
      // }
  
      // Store ONLY essential user data (no token needed)
     // Store ONLY essential user data (no token needed)
    // Store ONLY essential user data (no token needed)
    // Store ONLY essential user data (no token needed)
    // Store ONLY essential user data (no token needed)
    if (result.student) {
      localStorage.setItem('student', JSON.stringify(result.student));
      localStorage.setItem('role', 'student');
      localStorage.setItem('isAuthenticated', 'true');
      setSuccess(`Welcome ${result.student.name}!`);
      
      console.log('Redirecting to student dashboard...');
      
      // Use window.location.href for hard navigation (more reliable for protected routes)
      setTimeout(() => {
        window.location.href = '/student/dashboard';
      }, 800);
      
    } else if (result.mentor) {
      localStorage.setItem('mentor', JSON.stringify(result.mentor));
      localStorage.setItem('role', 'mentor');
      localStorage.setItem('isAuthenticated', 'true');
      setSuccess(`Welcome ${result.mentor.name}!`);
      
      setTimeout(() => {
        window.location.href = '/mentor';
      }, 800);
      
    } else if (result.admin) {
      localStorage.setItem('admin', JSON.stringify(result.admin));
      localStorage.setItem('role', 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      setSuccess(`Welcome ${result.admin.name}!`);
      
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 800);
    }

    // Keep loading state active during navigation

    // Keep loading state active during navigation

    // Keep loading state active during navigation
  
      // Keep loading state active during navigation
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || "Login failed. Please check your credentials.");
      setLoading(false); // Only set false on error
    }
  };
  const handleRoleChange = (newRole: LoginFormValues["role"]) => {
    setValue("role", newRole);
    setValue("userid", "");
    setValue("password", "");
    setError(null);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        position: "relative",
        background: `
          linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%),
          url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 4,
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            color: "white",
            fontWeight: 800,
            mb: 1,
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          Mentora
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255, 255, 255, 0.95)",
            fontWeight: 400,
            letterSpacing: "0.5px",
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
          }}
        >
          Student Login: SR Number + First Name
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            mt: 1,
            fontStyle: 'italic'
          }}
        >
          Example: SR Number: CA24771, Password: ashika
        </Typography>
      </Box>

      <Paper
        elevation={10}
        sx={{
          px: 4,
          py: 5,
          borderRadius: 5,
          width: { xs: "90%", sm: "420px" },
          backgroundColor: "white",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#7b2cbf" }}
        >
          {role === "admin" ? "Admin Login" : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
        </Typography>

        <Box display="flex" justifyContent="center" gap={2} my={3}>
          {["student", "mentor", "admin"].map((r) => (
            <Button
              key={r}
              onClick={() => handleRoleChange(r as LoginFormValues["role"])}
              variant={role === r ? "contained" : "outlined"}
              sx={{
                borderRadius: "30px",
                backgroundColor: role === r ? "#9f7aea" : "#f3e8ff",
                color: role === r ? "#fff" : "#7b2cbf",
                "&:hover": {
                  backgroundColor: role === r ? "#7b2cbf" : "#e0d4f7",
                },
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Button>
          ))}
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="userid"
            control={control}
            rules={{ required: `${role === 'admin' ? 'Admin ID' : role === 'mentor' ? 'Employee ID' : 'SR Number'} is required` }}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  role === "admin"
                    ? "Admin ID"
                    : role === "mentor"
                    ? "Employee ID"
                    : "SR Number (e.g., CA24771)"
                }
                fullWidth
                margin="normal"
                error={!!errors.userid}
                helperText={errors.userid?.message || ""}
                placeholder={role === "student" ? "Enter your SR Number" : ""}
                disabled={loading}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  role === "student" 
                    ? "Password (Your First Name)" 
                    : "Password"
                }
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={
                  role === "student" 
                    ? errors.password?.message || "Enter your first name in lowercase" 
                    : errors.password?.message || ""
                }
                placeholder={role === "student" ? "e.g., ashika" : ""}
                disabled={loading}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: "30px",
              backgroundColor: "#9f7aea",
              "&:hover": { backgroundColor: "#7b2cbf" },
              "&:disabled": { backgroundColor: "#d1d5db" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>

          {role === "student" && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
              mt={2}
              sx={{ fontStyle: 'italic' }}
            >
              Password hint: Your first name (lowercase)
            </Typography>
          )}
        </form>
      </Paper>

      {/* Error/Success Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={1500}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginScreen;