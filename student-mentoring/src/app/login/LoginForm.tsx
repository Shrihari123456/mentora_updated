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
      if (data.role === "admin") {
        if (data.userid === "admin123" && data.password === "secretpass") {
          toast.success("Admin authenticated!");
          await signin({ ...data, role: "admin" });
          router.push("/admin/dashboard");
          return;
        } else {
          toast.error("Invalid admin credentials");
        }
      } else {
        await signin(data);
        toast.success("Logged in successfully");

        if (data.role === "mentor") {
          router.push("/mentor");
          return;
        } else if (data.role === "student") {
          router.push("/student/dashboard");
          return;
        }
      }
    } catch (e) {
      console.error("Login error:", e);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        background: "linear-gradient(to bottom right, #f3e8ff, #e0d4f7)",
      }}
    >
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