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
  Container,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  EmojiObjects as EmojiIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

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
  const [showPassword, setShowPassword] = useState(false);
  const role = watch("role");

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let endpoint = '';
      let requestData = {};
      
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
      
      if (result.student) {
        localStorage.setItem('student', JSON.stringify(result.student));
        localStorage.setItem('role', 'student');
        localStorage.setItem('isAuthenticated', 'true');
        setSuccess(`Welcome ${result.student.name}!`);
        
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
  
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: LoginFormValues["role"]) => {
    setValue("role", newRole);
    setValue("userid", "");
    setValue("password", "");
    setError(null);
  };

  const getRoleIcon = (roleName: string) => {
    switch(roleName) {
      case 'student': return <SchoolIcon sx={{ fontSize: 20 }} />;
      case 'mentor': return <PersonIcon sx={{ fontSize: 20 }} />;
      case 'admin': return <AdminIcon sx={{ fontSize: 20 }} />;
      default: return null;
    }
  };

  const getRoleGradient = (roleName: string) => {
    switch(roleName) {
      case 'student': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'mentor': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'admin': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch(roleName) {
      case 'student': return '#9f7aea';
      case 'mentor': return '#f093fb';
      case 'admin': return '#4facfe';
      default: return '#9f7aea';
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(103, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0],
            x: [0, -80, 0],
            y: [0, 70, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, rgba(192, 132, 252, 0.05) 100%)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />
      </Box>

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Grow in timeout={800}>
          <Box>
            {/* Logo & Brand Section */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "20px",
                    p: 2,
                    mb: 2,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  <EmojiIcon sx={{ fontSize: 50, color: "white" }} />
                  <Typography
                    variant="h3"
                    sx={{
                      color: "white",
                      fontWeight: 800,
                      ml: 1,
                      background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      textShadow: "none",
                    }}
                  >
                    Mentora
                  </Typography>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  Welcome to Mentora
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    maxWidth: "400px",
                    mx: "auto",
                  }}
                >
                  Your gateway to mentorship, learning, and growth
                </Typography>
              </motion.div>
            </Box>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Paper
                elevation={24}
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.95)",
                }}
              >
                <Box sx={{ p: 4 }}>
                  {/* Role Selection */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", mb: 2, textAlign: "center" }}
                    >
                      Select your role
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={2}>
                      {["student", "mentor", "admin"].map((r) => (
                        <motion.div
                          key={r}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => handleRoleChange(r as LoginFormValues["role"])}
                            variant={role === r ? "contained" : "outlined"}
                            startIcon={getRoleIcon(r)}
                            sx={{
                              borderRadius: "30px",
                              px: 3,
                              py: 1,
                              textTransform: "capitalize",
                              fontWeight: 600,
                              background: role === r ? getRoleGradient(r) : "transparent",
                              color: role === r ? "white" : getRoleColor(r),
                              borderColor: getRoleColor(r),
                              "&:hover": {
                                background: role === r ? getRoleGradient(r) : "rgba(0,0,0,0.05)",
                                borderColor: getRoleColor(r),
                              },
                            }}
                          >
                            {r}
                          </Button>
                        </motion.div>
                      ))}
                    </Box>
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "&:hover fieldset": {
                                borderColor: getRoleColor(role),
                              },
                            },
                          }}
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
                          type={showPassword ? "text" : "password"}
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
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "&:hover fieldset": {
                                borderColor: getRoleColor(role),
                              },
                            },
                          }}
                        />
                      )}
                    />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                          mt: 3,
                          py: 1.5,
                          borderRadius: "30px",
                          background: getRoleGradient(role),
                          "&:hover": {
                            background: getRoleGradient(role),
                            filter: "brightness(1.05)",
                          },
                          "&:disabled": {
                            background: "#d1d5db",
                          },
                          fontSize: "1rem",
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <>
                            <LoginIcon sx={{ mr: 1 }} />
                            Login
                          </>
                        )}
                      </Button>
                    </motion.div>

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

                  {/* Additional Info */}
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      {role === "student" }
                      {role === "mentor" && "📧 Need help? Contact admin support"}
                      {role === "admin" && "🛡️ Secure admin access only"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                © 2024 Mentora. Empowering minds, shaping futures.
              </Typography>
            </Box>
          </Box>
        </Grow>
      </Container>

      {/* Error/Success Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ borderRadius: 2, boxShadow: 3 }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={1500}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          sx={{ borderRadius: 2, boxShadow: 3 }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginScreen;