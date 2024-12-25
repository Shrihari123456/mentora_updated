import React, { useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Interfaces for Student
interface Student {
  _id: string;
  name: string;
  srNo: string;
}

const AssignMentees: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const queryClient = useQueryClient();
  const mentorId = JSON.parse(localStorage.getItem("auth") || "{}").userDetails
    ._id;

  // Fetch unassigned students
  const { data: students = [], isFetching } = useQuery({
    queryKey: ["unassignedStudents"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:8080/students-unassigned"
      );
      return response.data;
    },
  });

  // Assign student mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (studentId: string) => {
      return axios.put(`http://localhost:8080/mentors/addStudent/${mentorId}`, {
        studentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unassignedStudents"],
      }); // Refresh student list
      setSnackbarMessage("Student assigned successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSelectedStudent(null);
    },
    onError: () => {
      setSnackbarMessage("Failed to assign student. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  // Handle assign mentee
  const handleAssignMentee = () => {
    if (!selectedStudent) {
      setSnackbarMessage("Please select a student.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    mutate(selectedStudent._id);
  };

  return (
    <Box padding={2}>
      <Typography variant="h4" gutterBottom>
        Assign Mentees
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select an unassigned student to add them as your mentee.
      </Typography>

      <Autocomplete
        options={students}
        getOptionLabel={(option) => `${option.name} (${option.srNo})`}
        value={selectedStudent}
        onChange={(_, newValue) => setSelectedStudent(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Unassigned Students"
            variant="outlined"
          />
        )}
        loading={isFetching}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleAssignMentee}
        disabled={!selectedStudent || isPending}
      >
        {isPending ? "Assigning..." : "Assign Mentee"}
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignMentees;
