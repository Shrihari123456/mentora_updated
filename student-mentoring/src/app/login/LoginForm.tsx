'use client';

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signin } from "./actions";

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
    defaultValues: { role: "mentor", userid: "", password: "" },
  });

  const [loading, setLoading] = useState(false);
  const role = watch("role");

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    
    try {
      await signin(data);
      toast.success("Logged in successfully");

      // Redirect based on role
      if (data.role === "mentor") {
        router.push("/mentor");
      } else if (data.role === "student") {
        router.push("/student/dashboard");
      } else if (data.role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch (e: any) {
      console.error("Login error:", e);
      const errorMessage = e?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
        backgroundAttachment: "fixed",
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.03) 10px,
              rgba(255, 255, 255, 0.03) 20px
            )
          `,
          pointerEvents: "none",
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          textAlign: "center",
          animation: "fadeInDown 1s ease-in-out",
          "@keyframes fadeInDown": {
            "0%": {
              opacity: 0,
              transform: "translateY(-20px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
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
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
          }}
        >
          A Student Mentoring Platform
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
          animation: "fadeInUp 1s ease-in-out",
          "@keyframes fadeInUp": {
            "0%": {
              opacity: 0,
              transform: "translateY(20px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#7b2cbf" }}
        >
          {role === "admin" ? "Admin Login" : "Login"}
        </Typography>

        <Box display="flex" justifyContent="center" gap={2} my={3}>
          {["mentor", "student", "admin"].map((r) => (
            <Button
              key={r}
              onClick={() => {
                setValue("role", r as LoginFormValues["role"]);
              }}
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
            rules={{ required: "ID is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  role === "admin"
                    ? "Admin ID"
                    : role === "mentor"
                    ? "Employee ID"
                    : "SR Number"
                }
                fullWidth
                margin="normal"
                error={!!errors.userid}
                helperText={errors.userid?.message || ""}
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
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message || ""}
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
        </form>
      </Paper>
    </Box>
  );
};

export default LoginScreen;