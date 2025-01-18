"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Box,
} from "@mui/material";

interface Mentor {
  _id: string;
  name: string;
  email: string;
}

interface Student {
  _id: string;
  name: string;
  admissionYear: string;
  section: string;
  srNo: string;
}

const MentorAssignment: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [admissionYear, setAdmissionYear] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loadingMentors, setLoadingMentors] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://student-mentoring-server.onrender.com/mentors")
      .then((response) => response.json())
      .then((data) => setMentors(data))
      .catch(() => setError("Failed to load mentors. Please try again."))
      .finally(() => setLoadingMentors(false));
  }, []);

  const fetchStudents = () => {
    if (admissionYear && section) {
      setLoadingStudents(true);
      fetch(
        `https://student-mentoring-server.onrender.com/students-unassigned?admissionYear=${admissionYear}&section=${section}`
      )
        .then((response) => response.json())
        .then((data) => setStudents(data))
        .catch(() => setError("Failed to load students. Please try again."))
        .finally(() => setLoadingStudents(false));
    } else {
      setError("Please select both admission year and section.");
    }
  };

  const handleAssign = async () => {
    if (!selectedMentor || selectedStudents.length === 0) {
      alert("Please select a mentor and at least one student.");
      return;
    }

    try {
      const requests = selectedStudents.map((studentId) =>
        fetch(
          `https://student-mentoring-server.onrender.com/mentors/addStudent/${selectedMentor}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ studentId }),
          }
        )
      );

      const responses = await Promise.all(requests);
      const failedResponses = responses.filter((response) => !response.ok);

      if (failedResponses.length > 0) {
        alert("Some students could not be assigned. Please try again.");
      } else {
        alert("Students assigned successfully!");
        setSelectedStudents([]);
        setStudents([]);
      }
    } catch {
      alert("An error occurred while assigning students. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            padding: "2rem",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header with Assign Button */}
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: "#333333",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              Assign Mentor to Students
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssign}
              sx={{ alignSelf: "flex-start" }}
            >
              Assign
            </Button>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Mentor Selection */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  color: "#555555",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                Select Mentor
              </Typography>
              {loadingMentors ? (
                <CircularProgress />
              ) : (
                <RadioGroup
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                >
                  {mentors.map((mentor) => (
                    <FormControlLabel
                      key={mentor._id}
                      value={mentor._id}
                      control={<Radio />}
                      label={`${mentor.name} (${mentor.email})`}
                    />
                  ))}
                </RadioGroup>
              )}
            </Grid>

            {/* Student Filters */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  color: "#555555",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                Select Students
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <FormControl fullWidth>
                  <InputLabel>Admission Year</InputLabel>
                  <Select
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(e.target.value)}
                  >
                    {[2022, 2023, 2024].map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  >
                    {["A", "B", "C", "D", "E", "P", "T", "U"].map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="contained"
                  onClick={fetchStudents}
                  disabled={loadingStudents}
                >
                  {loadingStudents ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Get Students"
                  )}
                </Button>
              </Box>
              {admissionYear && section && students.length > 0 && (
                <Box mt={4}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#555555",
                      fontWeight: "600",
                      marginBottom: "1rem",
                    }}
                  >
                    Students List
                  </Typography>
                  <List>
                    {students.map((student) => (
                      <ListItem key={student._id}>
                        <Checkbox
                          checked={selectedStudents.includes(student._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([
                                ...selectedStudents,
                                student._id,
                              ]);
                            } else {
                              setSelectedStudents(
                                selectedStudents.filter(
                                  (id) => id !== student._id
                                )
                              );
                            }
                          }}
                        />
                        <ListItemText
                          primary={student.name}
                          secondary={`SR No.: ${student.srNo}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Student List */}
        </Paper>
      </Container>
    </div>
  );
};

export default MentorAssignment;
