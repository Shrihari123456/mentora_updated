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
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "next/image";
import Link from "next/link";
import MenteeReport from "./menteeReport";
import { compile } from "@fileforge/react-print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
interface Subject {
  subject: string;
  cie1: number;
  cie2: number;
  cie3: number;
}

interface SemesterResult {
  semester: number;
  subjects: Subject[];
}

interface MarksData {
  sr?: string;
  usn?: string;
  semesters: SemesterResult[];
}

// ── Results Tab Component ────────────────────────────────────────────────────
const ResultsTab: React.FC<{ student: Student }> = ({ student }) => {
  const [marksData, setMarksData] = useState<MarksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student?.srNo) return;

    const fetchMarks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:8000/api/marks/markbyusn?sr=${encodeURIComponent(student.srNo)}`
        );

        if (res.status === 404) {
          setMarksData(null);
          setError("No marks found for this student yet.");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch marks");

        const data: MarksData = await res.json();
        setMarksData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [student?.srNo]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ── Error / Empty ────────────────────────────────────────────────────────
  if (error || !marksData || marksData.semesters.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography color="text.secondary" variant="h6">
          📭 {error ?? "No results available yet."}
        </Typography>
      </Box>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const total = (s: Subject) => s.cie1 + s.cie2 + s.cie3;

  const gradeColor = (t: number) => {
    if (t >= 36) return "success";
    if (t >= 28) return "warning";
    return "error";
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Showing CIE results for SR: <strong>{student.srNo}</strong>
        {student.usn && (
          <> &nbsp;|&nbsp; USN: <strong>{student.usn}</strong></>
        )}
      </Typography>

      {marksData.semesters.map((sem) => {
        const semTotal = sem.subjects.reduce((acc, s) => acc + total(s), 0);
        const semAvg = (semTotal / sem.subjects.length).toFixed(1);

        return (
          <Accordion
            key={sem.semester}
            defaultExpanded={sem.semester === marksData.semesters[marksData.semesters.length - 1].semester}
            sx={{
              mb: 1,
              borderRadius: "8px !important",
              "&:before": { display: "none" },
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "#e8eaf6",
                borderRadius: "8px",
                "& .MuiAccordionSummary-content": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mr: 1,
                },
              }}
            >
              <Typography fontWeight={600}>
                Semester {sem.semester}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={`${sem.subjects.length} subject${sem.subjects.length > 1 ? "s" : ""}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Avg: ${semAvg}`}
                  size="small"
                  color={gradeColor(parseFloat(semAvg)) as any}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>CIE 1</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>CIE 2</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>CIE 3</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sem.subjects.map((sub, idx) => {
                      const t = total(sub);
                      return (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:last-child td": { border: 0 },
                            "&:hover": { bgcolor: "#fafafa" },
                          }}
                        >
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Typography variant="body2" noWrap title={sub.subject}>
                              {sub.subject}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{sub.cie1}</TableCell>
                          <TableCell align="center">{sub.cie2}</TableCell>
                          <TableCell align="center">{sub.cie3}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={t}
                              size="small"
                              color={gradeColor(t) as any}
                              sx={{ fontWeight: 700, minWidth: 42 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const ViewMentees: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mentees, setMentees] = useState<Student[] | null>(null);
  const [filteredMentees, setFilteredMentees] = useState<Student[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mentorData, setMentorData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const mentor = localStorage.getItem("mentor");
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const role = localStorage.getItem("role");

      if (!isAuthenticated || role !== "mentor" || !mentor) {
        router.push("/");
        return null;
      }

      try {
        return JSON.parse(mentor);
      } catch (err) {
        console.error("Error parsing mentor data:", err);
        router.push("/");
        return null;
      }
    };

    const mentor = checkAuth();
    if (mentor) setMentorData(mentor);
  }, [router]);

  useEffect(() => {
    const fetchMentees = async () => {
      if (!mentorData?.empId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8000/api/mentors/students/emp/${mentorData.empId}`
        );
        if (!response.ok) throw new Error("Failed to fetch mentees");
        const data = await response.json();
        setMentees(data);
        setFilteredMentees(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (mentorData) fetchMentees();
  }, [mentorData]);

  useEffect(() => {
    if (mentees) {
      const filtered = mentees.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.srNo.toLowerCase().toString().includes(searchTerm.toLowerCase())
      );
      setFilteredMentees(filtered);
    }
  }, [searchTerm, mentees]);

  const handleOpenDialog = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab(0);   // always reset to first tab
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setActiveTab(0);
  };

  const handleChangeTab = (_: any, newValue: number) => setActiveTab(newValue);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f4f5f7" }}>
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
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "background.default", position: "relative" }}>
        <IconButton onClick={() => router.back()} sx={{ position: "absolute", top: 16, left: 16, color: "#3f51b5", backgroundColor: "#ffffff", boxShadow: 2, "&:hover": { backgroundColor: "#f0f0f0" } }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography align="center" variant="h5" sx={{ padding: 4, borderRadius: 2, bgcolor: "primary.main", color: "white", boxShadow: 3, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, maxWidth: 400, mb: 3 }}>
          No Mentees Assigned Yet!
        </Typography>
        {mentorData && <Typography variant="h6" sx={{ mb: 2 }}>Welcome, {mentorData.name}!</Typography>}
        <Button variant="contained" color="error" onClick={handleLogout} sx={{ mt: 2 }}>Logout</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, bgcolor: "#f4f5f7", minHeight: "100vh" }}>
      <IconButton onClick={() => router.back()} sx={{ position: "absolute", top: 16, left: 16, color: "#3f51b5", backgroundColor: "#ffffff", boxShadow: 2, "&:hover": { backgroundColor: "#f0f0f0" } }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ color: "#3f51b5", fontWeight: "bold", textShadow: "2px 2px 6px rgba(0,0,0,0.2)" }}>
          Mentees
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {mentorData && <Typography variant="h6" sx={{ color: "#666" }}>Mentor: {mentorData.name}</Typography>}
          <Button variant="outlined" color="error" onClick={handleLogout} size="small">Logout</Button>
        </Box>
      </Box>

      <Typography variant="h5" align="center" sx={{ color: "#666666", fontWeight: "normal", mb: 3, fontSize: "1rem" }}>
        Click on any of the mentees to view their details and download the report.
      </Typography>

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <TextField
          variant="outlined"
          label="Search Mentees"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "100%", maxWidth: 400 }}
        />
      </Box>

      {filteredMentees && filteredMentees.length ? (
        <Grid container spacing={3}>
          {filteredMentees.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.srNo}>
              <Paper
                sx={{ padding: 3, cursor: "pointer", textAlign: "center", borderRadius: 2, background: "linear-gradient(135deg, #e3f2fd, #bbdefb)", "&:hover": { boxShadow: 6, transform: "scale(1.02)" }, transition: "all 0.3s ease-in-out" }}
                onClick={() => handleOpenDialog(student)}
              >
                <Typography variant="h6" color="primary">{student.name}</Typography>
                <Typography variant="body2" color="textSecondary">SR Number: {student.srNo}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center" sx={{ mt: 4 }}>No students found!</Typography>
      )}

      {/* ── Dialog ── */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: "8px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ textAlign: "center", fontSize: "1.25rem", fontWeight: 600, borderBottom: "1px solid #ddd", paddingBottom: "16px" }}>
          Student Details
        </DialogTitle>

        <DialogContent sx={{ paddingTop: 0, backgroundColor: "#fafafa", borderRadius: "8px" }}>
          {/* ── 5 Tabs now ── */}
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{ mb: 3, "& .MuiTab-root": { padding: "12px 16px", fontWeight: 500 }, "& .MuiTabs-flexContainer": { borderBottom: "1px solid #ddd" } }}
          >
            <Tab label="Personal Details" />
            <Tab label="Parents" />
            <Tab label="Academic Profile" />
            <Tab label="Achievements" />
            <Tab label="Results" />  {/* ✅ NEW */}
          </Tabs>

          {selectedStudent && (
            <>
              {/* ── Tab 0: Personal ── */}
              {activeTab === 0 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <div className="flex flex-row">
                    <div className="flex flex-col">
                      <Typography><strong>Name of the student:</strong> {selectedStudent.name}</Typography>
                      <Typography><strong>Admission Year:</strong> {selectedStudent.admissionYear}</Typography>
                      <Typography><strong>SR Number:</strong> {selectedStudent.srNo}</Typography>
                      <Typography>
                        <strong>USN:</strong>
                        {selectedStudent.usn ? selectedStudent.usn : <em>Not Assigned</em>}
                      </Typography>
                      <Typography>
                        <strong>Entrance Exam Rank:</strong>{" "}
                        {selectedStudent.entranceExamRank ? (
                          <>{selectedStudent.entranceExamRank.rank} in {selectedStudent.entranceExamRank.examName}</>
                        ) : <em>Not Available</em>}
                      </Typography>
                      <Typography><strong>DOB:</strong> {new Date(selectedStudent.dob).toLocaleDateString()}</Typography>
                      <Typography><strong>Section:</strong> {selectedStudent.section}</Typography>
                      <Typography><strong>Permanent Address:</strong> {selectedStudent.permanentAddress}</Typography>
                      <Typography><strong>Height:</strong> {selectedStudent.height} cm</Typography>
                      <Typography><strong>Weight:</strong> {selectedStudent.weight} kg</Typography>
                      <Typography><strong>Blood Group:</strong> {selectedStudent.bloodGroup}</Typography>
                      <Typography><strong>Phone:</strong> {selectedStudent.phone}</Typography>
                      <Typography><strong>Email:</strong> {selectedStudent.email}</Typography>
                      <Typography><strong>Resident Type:</strong> {selectedStudent.residentType}</Typography>
                      {selectedStudent.hostelWardenDetails ? (
                        <Typography><strong>Hostel Warden:</strong> {selectedStudent.hostelWardenDetails}</Typography>
                      ) : selectedStudent.localGuardianDetails ? (
                        <Typography><strong>Local Guardian:</strong> {selectedStudent.localGuardianDetails}</Typography>
                      ) : " "}
                      <Typography>
                        <strong>Mentor:</strong>{" "}
                        {selectedStudent.mentor ? selectedStudent.mentor.name : <em>Not Assigned</em>}
                      </Typography>
                    </div>
                    <Image src={selectedStudent.photo} alt={selectedStudent.name} className="m-auto" width={150} height={150} unoptimized={true} />
                  </div>
                </Box>
              )}

              {/* ── Tab 1: Parents ── */}
              {activeTab === 1 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}><strong>Father</strong></Typography>
                  <Typography><strong>Name:</strong> {selectedStudent.father.name}</Typography>
                  <Typography><strong>Occupation:</strong> {selectedStudent.father.occupation}</Typography>
                  <Typography><strong>Work Address:</strong> {selectedStudent.father.workAddress}</Typography>
                  <Typography><strong>Permanent Address:</strong> {selectedStudent.father.permanentAddress}</Typography>
                  <Typography><strong>Education:</strong> {selectedStudent.father.education}</Typography>
                  <Typography><strong>Phone:</strong> {selectedStudent.father.phone}</Typography>
                  <Typography><strong>Email:</strong> {selectedStudent.father.email}</Typography>

                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}><strong>Mother</strong></Typography>
                  <Typography><strong>Name:</strong> {selectedStudent.mother.name}</Typography>
                  <Typography><strong>Occupation:</strong> {selectedStudent.mother.occupation}</Typography>
                  <Typography><strong>Work Address:</strong> {selectedStudent.mother.workAddress}</Typography>
                  <Typography><strong>Permanent Address:</strong> {selectedStudent.mother.permanentAddress}</Typography>
                  <Typography><strong>Education:</strong> {selectedStudent.mother.education}</Typography>
                  <Typography><strong>Phone:</strong> {selectedStudent.mother.phone}</Typography>
                  <Typography><strong>Email:</strong> {selectedStudent.mother.email}</Typography>

                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}><strong>Siblings</strong></Typography>
                  {selectedStudent.siblings.length === 0 ? (
                    <Typography>No siblings found!</Typography>
                  ) : (
                    selectedStudent.siblings.map((sibling, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography><strong>Relation:</strong> {sibling.relationType}</Typography>
                        <Typography><strong>Name:</strong> {sibling.name}</Typography>
                        <Typography><strong>Occupation:</strong> {sibling.occupation}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              {/* ── Tab 2: Academic Profile ── */}
              {activeTab === 2 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  <Typography><strong>Name of Previous Institution:</strong> {selectedStudent.previousInstitutionDetails}</Typography>
                  <Typography><strong>Previous Course Completed:</strong> {selectedStudent.previousCourse}</Typography>
                  <Typography><strong>Medium of Instruction:</strong> {selectedStudent.mediumOfInstruction}</Typography>
                </Box>
              )}

              {/* ── Tab 3: Achievements ── */}
              {activeTab === 3 && (
                <Box sx={{ px: 2, mb: 3 }}>
                  {selectedStudent.achievements.length === 0 ? (
                    <Typography>No achievements found!</Typography>
                  ) : (
                    selectedStudent.achievements.map((achievement, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography><strong>Domain:</strong> {achievement.domain}</Typography>
                        <Typography><strong>Activity:</strong> {achievement.activity}</Typography>
                        <Typography><strong>Prize:</strong> {achievement.prizeDetails}</Typography>
                        <Typography><strong>Institute:</strong> {achievement.institution}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              {/* ── Tab 4: Results ✅ NEW ── */}
              {activeTab === 4 && <ResultsTab student={selectedStudent} />}
            </>
          )}
        </DialogContent>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button onClick={handleCloseDialog} variant="contained" color="primary" sx={{ textTransform: "none", padding: "8px 24px", fontWeight: 500 }}>
            Close
          </Button>
          <Button
  onClick={async () => {
    // ✅ Fetch marks
    let marksData: MarksData | null = null;
    try {
      const res = await fetch(
        `http://localhost:8000/api/marks/markbyusn?sr=${encodeURIComponent(selectedStudent!.srNo)}`
      );
      if (res.ok) marksData = await res.json();
    } catch (e) {
      console.error("Could not fetch marks", e);
    }

    // ✅ Build results HTML as string
    const resultsHTML =
      marksData && marksData.semesters?.length > 0
        ? marksData.semesters
            .map(
              (sem) => `
              <div style="margin-bottom: 16px;">
                <div style="background-color: #3f51b5; color: white; padding: 6px 8px; font-weight: bold;">
                  Semester ${sem.semester}
                </div>
                <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
                  <tr style="background-color:#e8eaf6;">
                    <th style="border:1px solid black; padding:8px; text-align:left;">Subject</th>
                    <th style="border:1px solid black; padding:8px; text-align:center;">CIE 1</th>
                    <th style="border:1px solid black; padding:8px; text-align:center;">CIE 2</th>
                    <th style="border:1px solid black; padding:8px; text-align:center;">CIE 3</th>
                    <th style="border:1px solid black; padding:8px; text-align:center;">Total</th>
                  </tr>
                  ${sem.subjects
                    .map(
                      (sub, i) => `
                    <tr style="background-color:${i % 2 === 0 ? "#fff" : "#f9f9f9"};">
                      <td style="border:1px solid black; padding:8px;">${sub.subject}</td>
                      <td style="border:1px solid black; padding:8px; text-align:center;">${sub.cie1}</td>
                      <td style="border:1px solid black; padding:8px; text-align:center;">${sub.cie2}</td>
                      <td style="border:1px solid black; padding:8px; text-align:center;">${sub.cie3}</td>
                      <td style="border:1px solid black; padding:8px; text-align:center; font-weight:bold;">
                        ${sub.cie1 + sub.cie2 + sub.cie3}
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              </div>
            `
            )
            .join("")
        : `<p>No CIE results available for this student.</p>`;

    // ✅ Compile base HTML (personal, family, academic, achievements)
    const baseHtml = await compile(
      <MenteeReport student={selectedStudent!} />
    );

    // ✅ Inject results section into compiled HTML
    const resultsSection = `
      <div style="font-family: Arial, sans-serif; margin: 20px;">
        <div style="font-weight: bold; margin-top: 20px; margin-bottom: 10px; font-size: 16px;">
          V. CIE Results
        </div>
        ${resultsHTML}
      </div>
    `;

    const finalHtml = baseHtml.includes("</body>")
      ? baseHtml.replace("</body>", `${resultsSection}</body>`)
      : baseHtml + resultsSection;

    // ✅ Generate and download PDF
    const html2pdf = (await import("html2pdf.js")).default;
    const container = document.createElement("div");
    container.innerHTML = finalHtml;
    document.body.appendChild(container);

    await html2pdf()
      .set({
        margin: 10,
        filename: `${selectedStudent!.name}_mentee_report.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();

    document.body.removeChild(container);
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
          <Link passHref href={`/mentor/student-edit/${selectedStudent?.srNo}`}>
            <Button variant="contained" color="primary" sx={{ textTransform: "none", padding: "8px 24px", fontWeight: 500, ml: 2 }}>
              Edit
            </Button>
          </Link>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ViewMentees;