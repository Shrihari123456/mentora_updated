"use client";

import React, { useState, useEffect } from "react";
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
import Image from "next/image";
import MenteeReport from "./menteeReport";
import { compile } from "@fileforge/react-print";
import { useSession } from "next-auth/react";

const ViewMentees: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mentees, setMentees] = useState<Student[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    const fetchMentees = async () => {
      setIsLoading(true);
      setError(null);
      if (!session.data?.user.userid) return;
      try {
        const response = await fetch(
          `http://localhost:8080/mentors/students/${session.data?.user.userid}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch mentees");
        }
        const data = await response.json();
        setMentees(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentees();
  }, [session.data?.user.userid]);

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
        {error}
      </Typography>
    );

  if (!mentees || mentees.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Typography
          align="center"
          variant="h5"
          sx={{
            padding: 4,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "white",
            boxShadow: 3,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            maxWidth: 400,
          }}
        >
          No Mentees Assigned Yet!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, bgcolor: "#f4f5f7", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          mb: 4,
          color: "#3f51b5",
          fontWeight: "bold",
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        Mentees
      </Typography>
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "#666666", // Lighter color for a subtler look
          fontWeight: "normal", // Reduced boldness
          mb: 5, // Reduced margin to bring subtitle closer to the title
          fontSize: "1rem", // Slightly smaller size
        }}
      >
        Click on any of the mentees to view their details and download the
        report.
      </Typography>
      {mentees.length ? (
        <Grid container spacing={3}>
          {mentees.map((student) => (
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
            <Tab label="Academic Profile" />
            <Tab label="Achievements" />
          </Tabs>
          {selectedStudent && (
            <>
              {activeTab === 0 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <div className="flex flex-row">
                    <div className="flex flex-col">
                      <Typography>
                        <strong>Name of the student:</strong>{" "}
                        {selectedStudent.name}
                      </Typography>
                      <Typography>
                        <strong>Admission Year:</strong>{" "}
                        {selectedStudent.admissionYear}
                      </Typography>
                      <Typography>
                        <strong>SR Number:</strong> {selectedStudent.srNo}
                      </Typography>
                      <Typography>
                        <strong>USN:</strong>
                        {selectedStudent.usn ? (
                          selectedStudent.usn
                        ) : (
                          <em>Not Assigned</em>
                        )}
                      </Typography>
                      <Typography>
                        <strong>Entrance Exam Rank:</strong>{" "}
                        {selectedStudent.entranceExamRank ? (
                          <>
                            {selectedStudent.entranceExamRank.rank} in{" "}
                            {selectedStudent.entranceExamRank.examName}
                          </>
                        ) : (
                          <em>Not Available</em>
                        )}
                      </Typography>
                      <Typography>
                        <strong>DOB:</strong>{" "}
                        {new Date(selectedStudent.dob).toLocaleDateString()}
                      </Typography>

                      <Typography>
                        <strong>Section:</strong> {selectedStudent.section}
                      </Typography>
                      <Typography>
                        <strong>Permanent Address:</strong>{" "}
                        {selectedStudent.permanentAddress}
                      </Typography>
                      <Typography>
                        <strong> Height:</strong> {selectedStudent.height} cm
                      </Typography>
                      <Typography>
                        <strong> Weight:</strong> {selectedStudent.weight} kg
                      </Typography>
                      <Typography>
                        <strong>Blood Group:</strong>{" "}
                        {selectedStudent.bloodGroup}
                      </Typography>
                      <Typography>
                        <strong>Phone:</strong> {selectedStudent.phone}
                      </Typography>
                      <Typography>
                        <strong>Email:</strong> {selectedStudent.email}
                      </Typography>
                      <Typography>
                        <strong>Resident Type:</strong>{" "}
                        {selectedStudent.residentType}
                      </Typography>
                      {selectedStudent.hostelWardenDetails ? (
                        <Typography>
                          <strong>Hostel Warden : </strong>
                          {selectedStudent.hostelWardenDetails}
                        </Typography>
                      ) : selectedStudent.localGuardianDetails ? (
                        <Typography>
                          <strong>Local Guardian : </strong>
                          {selectedStudent.hostelWardenDetails}
                        </Typography>
                      ) : (
                        " "
                      )}
                      <Typography>
                        <strong>Mentor:</strong>{" "}
                        {selectedStudent.mentor ? (
                          selectedStudent.mentor.name
                        ) : (
                          <em>Not Assigned</em>
                        )}
                      </Typography>
                    </div>
                    <Image
                      src={selectedStudent.photo}
                      alt={selectedStudent.name}
                      className="m-auto"
                      width={150}
                      height={150}
                    />
                  </div>
                </Box>
              )}
              {activeTab === 1 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    <strong>Father</strong>
                  </Typography>
                  <Typography>
                    <strong>Name:</strong> {selectedStudent.father.name}
                  </Typography>
                  <Typography>
                    <strong>Occupation:</strong>{" "}
                    {selectedStudent.father.occupation}
                  </Typography>
                  <Typography>
                    <strong>Work Address: </strong>
                    {selectedStudent.father.workAddress}
                  </Typography>
                  <Typography>
                    <strong>Permanent Address</strong>{" "}
                    {selectedStudent.father.permanentAddress}
                  </Typography>
                  <Typography>
                    <strong>Education:</strong>{" "}
                    {selectedStudent.father.education}
                  </Typography>

                  <Typography>
                    <strong>Phone:</strong> {selectedStudent.father.phone}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedStudent.father.email}
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    <strong>Mother</strong>
                  </Typography>

                  <Typography>
                    <strong>Name:</strong> {selectedStudent.mother.name}
                  </Typography>
                  <Typography>
                    <strong>Occupation:</strong>{" "}
                    {selectedStudent.mother.occupation}
                  </Typography>
                  <Typography>
                    <strong>Work Address: </strong>
                    {selectedStudent.mother.workAddress}
                  </Typography>
                  <Typography>
                    <strong>Permanent Address</strong>{" "}
                    {selectedStudent.mother.permanentAddress}
                  </Typography>
                  <Typography>
                    <strong>Education:</strong>{" "}
                    {selectedStudent.mother.education}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {selectedStudent.mother.phone}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedStudent.mother.email}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    <strong>Siblings</strong>
                  </Typography>
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
              {activeTab === 2 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <Typography>
                    <strong>Name of Previous Institution:</strong>{" "}
                    {selectedStudent.previousInstitutionDetails}
                  </Typography>
                  <Typography>
                    <strong>Previous Course Completed:</strong>{" "}
                    {selectedStudent.previousCourse}
                  </Typography>
                  <Typography>
                    <strong>Medium of Instruction:</strong>{" "}
                    {selectedStudent.mediumOfInstruction}
                  </Typography>
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
                        <Typography>
                          <strong>Institue:</strong> {achievement.institution}
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
          <Button
            onClick={async () => {
              const html = await compile(
                <MenteeReport student={selectedStudent!} />
              );

              const pdfWindow = window.open("", "_blank");
              pdfWindow?.document.open();
              pdfWindow?.document.write(html);
              pdfWindow?.document.close();
            }}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              padding: "8px 24px",
              fontWeight: 500,
              ml: 2,
            }}
          >
            Download Mentee Details (PDF)
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ViewMentees;
