import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Student {
  name: string;
  srNo: string;
  email: string;
  admissionYear: number;
  section: string;
  dob: string;
  phone: string;
  permanentAddress: string;
  presentAddress: string;
  father: { name: string; occupation: string; phone: string };
  mother: { name: string; occupation: string; phone: string };
  siblings: { relationType: string; name: string; occupation: string }[];
  achievements: { domain: string; activity: string; prizeDetails: string }[];
  mentor: { name: string } | null;
}

const ViewAllStudents: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: students,
    isLoading,
    error,
  } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8080/students");
      return response.data;
    },
  });

  const handleOpenDialog = (student: Student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setActiveTab(0);
  };

  const handleChangeTab = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f4f5f7",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography align="center" color="error" sx={{ mt: 4 }}>
        Error loading students!
      </Typography>
    );

  return (
    <Box sx={{ padding: 3, bgcolor: "#f4f5f7", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        All Students
      </Typography>
      {students?.length ? (
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.srNo}>
              <Paper
                sx={{
                  padding: 3,
                  cursor: "pointer",
                  textAlign: "center",
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                  "&:hover": { boxShadow: 6, transform: "scale(1.02)" },
                  transition: "all 0.3s ease-in-out",
                }}
                onClick={() => handleOpenDialog(student)}
              >
                <Typography variant="h6" color="primary">
                  {student.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  SR Number: {student.srNo}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center" sx={{ mt: 4 }}>
          No students found!
        </Typography>
      )}

      {/* Dialog for Student Details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px", // Rounded corners
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "1.25rem",
            fontWeight: 600,
            borderBottom: "1px solid #ddd",
            paddingBottom: "16px",
          }}
        >
          Student Details
        </DialogTitle>
        <DialogContent
          sx={{
            paddingTop: 0,
            backgroundColor: "#fafafa",
            borderRadius: "8px",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                padding: "12px 16px",
                fontWeight: 500,
              },
              "& .MuiTabs-flexContainer": {
                borderBottom: "1px solid #ddd",
              },
            }}
          >
            <Tab label="Personal Details" />
            <Tab label="Parents" />
            <Tab label="Siblings" />
            <Tab label="Achievements" />
          </Tabs>
          {selectedStudent && (
            <>
              {activeTab === 0 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <Typography>
                    <strong>Name:</strong> {selectedStudent.name}
                  </Typography>
                  <Typography>
                    <strong>SR Number:</strong> {selectedStudent.srNo}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {selectedStudent.phone}
                  </Typography>
                  <Typography>
                    <strong>DOB:</strong>{" "}
                    {new Date(selectedStudent.dob).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    <strong>Address:</strong> {selectedStudent.permanentAddress}
                  </Typography>
                  <Typography>
                    <strong>Mentor:</strong>{" "}
                    {selectedStudent.mentor ? (
                      selectedStudent.mentor.name
                    ) : (
                      <em>Not Assigned</em>
                    )}
                  </Typography>
                </Box>
              )}
              {activeTab === 1 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <Typography>
                    <strong>Father:</strong> {selectedStudent.father.name}
                  </Typography>
                  <Typography>
                    <strong>Occupation:</strong>{" "}
                    {selectedStudent.father.occupation}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {selectedStudent.father.phone}
                  </Typography>
                  <Typography>
                    <strong>Mother:</strong> {selectedStudent.mother.name}
                  </Typography>
                  <Typography>
                    <strong>Occupation:</strong>{" "}
                    {selectedStudent.mother.occupation}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {selectedStudent.mother.phone}
                  </Typography>
                </Box>
              )}
              {activeTab === 2 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  {selectedStudent.siblings.length === 0 ? (
                    <Typography>No siblings found!</Typography>
                  ) : (
                    selectedStudent.siblings.map((sibling, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography>
                          <strong>Relation:</strong> {sibling.relationType}
                        </Typography>
                        <Typography>
                          <strong>Name:</strong> {sibling.name}
                        </Typography>
                        <Typography>
                          <strong>Occupation:</strong> {sibling.occupation}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}
              {activeTab === 3 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  {selectedStudent.achievements.length === 0 ? (
                    <Typography>No achievements found!</Typography>
                  ) : (
                    selectedStudent.achievements.map((achievement, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography>
                          <strong>Domain:</strong> {achievement.domain}
                        </Typography>
                        <Typography>
                          <strong>Activity:</strong> {achievement.activity}
                        </Typography>
                        <Typography>
                          <strong>Prize:</strong> {achievement.prizeDetails}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              padding: "8px 24px",
              fontWeight: 500,
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ViewAllStudents;
