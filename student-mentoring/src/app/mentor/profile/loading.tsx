import {
  Box,
  Typography,
  Grid,
  TextField,
  Paper,
  CircularProgress,
} from "@mui/material";

export default async function MentorProfileLoading() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        padding: 3,
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
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

        <CircularProgress
          size={100}
          thickness={2}
          sx={{ display: "block", margin: "auto" }}
        />
      </Paper>
    </Box>
  );
}
