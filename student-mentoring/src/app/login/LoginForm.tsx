"use client";
import { signIn } from "@/auth";
import {
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { signin } from "./actions";
import { toast } from "sonner";
import { metadata } from "../layout";

interface LoginFormValues {
  role: "mentor" | "student";
  userid: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { role: "mentor", userid: "", password: "" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signin(data);
      toast.dismiss();
      toast.success("Logged in successfully");
    } catch (e) {
      console.error(e);
      toast.dismiss();
      // @ts-expect-error
      if (e.message === "NEXT_REDIRECT") {
        return;
      }

      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f4f6f9"
      padding={2}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          borderRadius: 3,
          width: { xs: "90%", sm: "400px" },
          boxShadow: 3,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#3f51b5" }}
        >
          Login
        </Typography>

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              value={field.value}
              exclusive
              onChange={(_, value) => field.onChange(value || field.value)}
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <ToggleButton
                value="mentor"
                sx={{
                  padding: "10px 20px",
                  borderRadius: "30px",
                  backgroundColor: "#e8eaf6",
                  "&.Mui-selected": {
                    backgroundColor: "#3f51b5",
                    color: "#fff",
                  },
                  "&:hover": {
                    backgroundColor: "#3F51B5DA",
                    color: "#fff",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#3F51B5DA",
                    color: "#fff",
                  },
                }}
              >
                Mentor
              </ToggleButton>
              <ToggleButton
                value="student"
                sx={{
                  padding: "10px 20px",
                  borderRadius: "30px",
                  backgroundColor: "#e8eaf6",
                  "&.Mui-selected": {
                    backgroundColor: "#3f51b5",
                    color: "#fff",
                  },
                  "&:hover": {
                    backgroundColor: "#3F51B5DA",
                    color: "#fff",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#3F51B5DA",
                    color: "#fff",
                  },
                }}
              >
                Student
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />

        <Controller
          name="userid"
          control={control}
          rules={{ required: "ID is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label={watch("role") === "mentor" ? "Employee ID" : "SR Number"}
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.userid}
              helperText={errors.userid ? errors.userid.message : ""}
              sx={{
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#b0bec5",
                  },
                  "&:hover fieldset": {
                    borderColor: "#3f51b5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3f51b5",
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
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ""}
              sx={{
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#b0bec5",
                  },
                  "&:hover fieldset": {
                    borderColor: "#3f51b5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3f51b5",
                  },
                },
              }}
            />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 3,
            padding: "12px",
            fontSize: "16px",
            borderRadius: "50px",
            boxShadow: 2,
            "&:hover": {
              backgroundColor: "#303f9f",
            },
          }}
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginScreen;
