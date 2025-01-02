import {
  Box,
  Typography,
  Grid,
  TextField,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface MentorProfileData {
  name: string;
  empId: string;
  dept: string;
  designation: string;
  email: string;
  phone: string;
}

const MentorProfile: React.FC = () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");

  const { data, isLoading, error } = useQuery<MentorProfileData>({
    queryKey: ["mentorProfile", auth?.userDetails?._id],
    queryFn: async () => {
      if (!auth?.userDetails?._id) throw new Error("No mentor ID found");
      const response = await axios.get(
        `https://student-mentoring-server.onrender.com/mentors/empID/${auth.userDetails.empId}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "100vh", bgcolor: "#f4f5f7" }}
      >
        <CircularProgress color="primary" />
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
            color: "#d32f2f",
            borderRadius: 2,
            maxWidth: 400,
          }}
        >
          <Typography variant="h6">Error fetching profile!</Typography>
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
        bgcolor: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
      }}
    >
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
        {/* Profile Title */}
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
        <Grid container spacing={3}>
          {[
            { label: "Name", value: data?.name },
            { label: "Employee ID", value: data?.empId },
            { label: "Designation", value: data?.designation },
            { label: "Department", value: data?.dept },
            { label: "Email", value: data?.email },
            { label: "Phone", value: data?.phone },
          ].map((field, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextField
                label={field.label}
                value={field.value || ""}
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
      </Paper>
    </Box>
  );
};

export default MentorProfile;
